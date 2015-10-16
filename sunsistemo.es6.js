let scene, camera, light, renderer;
let controls, stats;

import Body from "./systems.es6.js";
import * as systems from "./systems.es6.js";
import * as calc from "./calc.es6.js";

let bodyTexture = true;
let numBodies = 1;
let sphereP = 16;
let sunOn;

var steps;
let system, bodies;
let spheres;

// let sysDict = {
//     "Random Bodies": systems.genBodies , 
//     "Solar System": systems.genSolarSystem, 
//     "Total Angular Momentum": systems.genBodiesRot,
//     "Three Bodies": systems.gen3Bodies
// };

let menuList = [    
    {"label":"Empty", "function": systems.genBodies, "args": [0, true, false]},
    {"label":"Only Sun", "function": systems.genBodiesRot, "args": [0, true, true]},
    {"label":"Two Bodies", "function": systems.gen2Bodies, "args": [true]},
    {"label":"Three Bodies", "function": systems.gen3Bodies, "args": [true]},
    {"label":"Random Bodies", "function": systems.genBodies, "args": [200, true, false]}, 
    {"label":"Angular Momentum", "function": systems.genBodiesRot, "args": [200, true, true, false]},
    {"label":"Angular with Bounce", "function": systems.genBodiesRot, "args": [200, true, true, true]},
    {"label":"Solar System", "function": systems.genSolarSystem, "args": [true] }

];
gui(menuList);

simulate(menuList[0].function, [0, true, false]);

function gui(buttonList) {
    let buttonHeight = 50
    let buttonWidth = 200
    let body = d3.select("body")
    let menuDiv = body.selectAll("#gui")
    menuDiv.style()
    let menuSvg = menuDiv.append("svg")
    .attr("width", buttonWidth + 50 + "px")
    .attr("height", buttonHeight * menuList.length + 20 + "px")
    .attr("class", "menuSvg");

    var buttons = menuSvg.selectAll(".button")
        .data(menuList)
    // console.log(dict)

    buttons.enter()
        .append("g")
        .attr("transform", function(d,i){
                return ("translate(" + 10 + "," + ((i * buttonHeight) + 10) + ")")
            })
        .attr("class", "button");

    buttons.append("rect")
        .style("fill", "#aaa")
        .style("opacity",".5")
        .attr("width", (buttonWidth))
        .attr("height", buttonHeight - 3)
        .attr("rx", 5)
        .attr("ry", 5);
    
    buttons.append("text")
        .style("fill", "black")
        .attr("dx", ".35em")
        .attr("y", buttonHeight / 2)
        .attr("dy", ".35em")
        .text(function(d){return d.label});

    buttons.on("mouseover", function(d){
                d3.select(d3.event.target.parentNode)
                    .classed("highlight", true);
            })
        .on("mouseout", function(d){
                d3.select(d3.event.target.parentNode)
                    .classed("highlight", false);
            })

        .on("click", function(d){
                d3.selectAll(".selected")
                    .classed("selected", false)
                clearSimulation()
                simulate(d.function, d.args)
                d3.select(d3.event.target.parentNode)
                    .classed("selected", true);
            })
    
    }

function clearSimulation() {
    let simDiv = document.getElementById("sim");
    while (simDiv.firstChild) simDiv.removeChild(simDiv.firstChild);
    let statDiv = d3.select("#stat").remove();

   } 
function simulate(sysFunc, args){
    system = sysFunc(...args);
    console.log(system)
    bodies = system.bodies;
    if (system.hasOwnProperty("stepsPerFrame")) {
        steps = system.stepsPerFrame;
    } 
    else { steps = 1; }
    [spheres] = init();
    animate_leapfrog();

    window.addEventListener('resize', onWindowResize, true);
}


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(system.camera.x, system.camera.y, system.camera.z);
    scene.add(camera);

    // orbitcontrols
    controls = new THREE.OrbitControls(camera);

    // starfield skymap
    let geometry  = new THREE.SphereGeometry(100000, 32, 32);
    let material  = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("textures/galaxy_starfield.png"),
        side: THREE.BackSide
    });
    let skymap  = new THREE.Mesh(geometry, material);
    scene.add(skymap);

    // spheres
    let spheres = [];
    for (let b of bodies) {
        let geometry = new THREE.SphereGeometry(b.rad, system.sphereP, sphereP);
        let material = new THREE.MeshPhongMaterial();
        material.map = b.getTexture();
        material.bumpMap = b.getBumpMap();
        material.bumpScale = 0.1;
        material.specularMap = b.getSpecularMap();
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(b.r.x, b.r.y, b.r.z);
        scene.add(sphere);
        spheres.push(sphere);
    }

    if (system.sunOn){
        let sun = spheres[0];
        sun.material.emissive.set(0xfcd440);

        // sunlight
        let light = new THREE.PointLight(0xfcd440, 2, 2000);
        sun.add(light);

        // sun glow
        let spriteMaterial = new THREE.SpriteMaterial({
            map: THREE.ImageUtils.loadTexture("textures/glow.png"),
            color: 0xfc843f, transparent: false, blending: THREE.AdditiveBlending
        });
        let sprite = new THREE.Sprite(spriteMaterial);
        let glowRadius = sun.geometry.boundingSphere.radius * 5;
        sprite.scale.set(glowRadius, glowRadius, 1.0);
        sun.add(sprite);
    }
    else {
        // sunlight
        let light = new THREE.HemisphereLight(0xfcd440, 2);
        
    }

    // overall light
    let ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("sim").appendChild(renderer.domElement);
    // stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    return [spheres];
}

function animate_leapfrog() {
    bodies = calc.leapfrog(bodies, system.stepsize);
    requestAnimationFrame(animate);
}

function animate() {
    for (let i = 0; i < steps; i ++) {
        bodies = calc.symplectic_euler(bodies, system.stepsize);
    }

    [bodies, spheres] = calc.removeLostBodies(bodies, spheres, scene, 2000);

    for (let i = 0; i < bodies.length; i++) {
        let pos = bodies[i].r;
        if (system.hasOwnProperty("scalePosition")) {
            pos = system.scalePosition(pos);
        }
        spheres[i].position.set(pos.x, pos.y, pos.z);

        spheres[i].rotation.x += bodies[i].rot.x;
        spheres[i].rotation.y += bodies[i].rot.y;
        spheres[i].rotation.z += bodies[i].rot.z;

        if (system.collisions) {
            for (let j = i + 1; j < bodies.length; j++) {
                if ((i !== j) && (calc.touch(bodies[i],bodies[j]))) {
                    calc.elasticCollision(bodies[i],bodies[j]);
                    // calc.mergeCollision(bodies, spheres, scene, bodies[i], bodies[j]);
                }
            }
        }
    }

    requestAnimationFrame(animate);
    render();
    controls.update();
    stats.update();
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    renderer.render(scene, camera);
}
