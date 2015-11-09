let THREE = require("three.js");
let OrbitControls = require("three-orbit-controls")(THREE);
let d3 = require("d3");
let Stats = require("stats.js");

let scene, camera, light, renderer;
let controls, stats;
let requestId = undefined;

import Body from "./systems.js";
import * as systems from "./systems.js";
import * as calc from "./calc.js";

let bodyTexture = true;
let numBodies = 1;
let sphereP = 12;
let sunOn;

let timer;
let system, bodies, spheres;

let choreoSubmenuList = [
    {"label": "ButterFly1", "function": systems.genButterFly1, "args": []},
    {"label": "ButterFly2", "function": systems.genButterFly2, "args": []},
    {"label": "Butterfly3", "function": systems.genButterfly3, "args": []},
    {"label": "Butterfly4", "function": systems.genButterfly4, "args": []},
    {"label": "Bumblebee", "function": systems.genBumblebee, "args": []},
    {"label": "Moth1", "function": systems.genMoth1, "args": []},
    {"label": "Moth2", "function": systems.genMoth2, "args": []},
    {"label": "Moth3", "function": systems.genMoth3, "args": []},
    {"label": "Goggles", "function": systems.genGoggles, "args": []},
    {"label": "Dragonfly", "function": systems.genDragonfly, "args": []},
    {"label": "Yarn", "function": systems.genYarn, "args": []},
    {"label": "YinYang1", "function": systems.genYinYang1, "args": []},
    {"label": "YinYang2", "function": systems.genYinYang2, "args": []}
];

let menuList = [
    {"label": "The Sun", "function": systems.genBodiesRot, "args": [0, true, true]},
    {"label": "Two Bodies", "function": systems.gen2Bodies, "args": [true]},
    {"label": "Three Bodies", "function": systems.gen3Bodies, "args": [true]},
    {"label": "Solar System", "function": systems.genSolarSystem, "args": [true]},
    {"label": "Random Bodies", "function": systems.genBodies, "args": [200, "solar", false, true]},
    {"label": "Angular Momentum", "function": systems.genBodiesRot, "args": [200, "solar", true, false]},
    {"label": "Angular with Bounce", "function": systems.genBodiesRot, "args": [200, "balls", true, true, true]},
    {"label": "Choreographies", "function": showSubmenu, "args": [choreoSubmenuList]}
];
gui(menuList);


function getSystem(label) {
    for (let s of menuList) {
        if (s.label === label) {
            return s;
        }
    }

    for (let s of choreoSubmenuList) {
        if (s.label === label) {
            return s;
        }
    }

    return menuList[0];
}


function getURLParameters() {
    let params = window.location.search;
    let URLParameters = {s: menuList[0].label};           // default system

    if (params.startsWith('?')) {
        params = params.slice(1).split('&');

        for (let p of params) {
            let par = p.split('=');
            URLParameters[par[0]] = decodeURIComponent(par[1].replace(/-/g, ' '));
        }
    }
    return URLParameters;
}
let URLParameters = getURLParameters();
let systemLabel = getSystem(URLParameters.s);
simulate(systemLabel);


function setURLParameter(parameter, value) {
    URLParameters[parameter] = value;
    let search = [];

    for (let key of Object.keys(URLParameters)) {
        search.push(key + '=' +
                    encodeURIComponent(URLParameters[key].replace(/ /g, '-')));
    }

    if (URLParameters.hasOwnProperty('s')) {
        let label = URLParameters.s;
        window.history.replaceState({s: label}, "Sunsistemo - " + label,
                                    '?' + search.join('&'));
    }
}


function gui(buttonList) {
    let buttonHeight = 50;
    let buttonWidth = 200;
    let body = d3.select("body");
    let menuDiv = body.selectAll("#gui");
    menuDiv.style();
    let menuSvg = menuDiv.append("svg")
    .attr("width", 400 + 50 + "px")
    .attr("height", "800px")
    .attr("class", "menuSvg");

    var buttons = menuSvg.selectAll(".button")
            .data(menuList);

    buttons.enter()
        .append("g")
        .attr("transform", function(d, i) {
            return ("translate(" + 10 + "," + ((i * buttonHeight) + 10) + ")");
        })
        .attr("class", "button");

    buttons.append("rect")
        // .style("fill", "#aaa")
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
        .text(function(d) {return d.label;});

    buttons.on("mouseover", function(d) {
        d3.select(d3.event.target.parentNode)
            .classed("highlight", true);
    })
        .on("mouseout", function(d) {
            d3.select(d3.event.target.parentNode)
                .classed("highlight", false);
        })
        .on("click", function(d) {
            d3.selectAll(".selected")
                .classed("selected", false);
            if (d["function"] == showSubmenu) {
                clearSubmenu();
                d["function"](...d["args"]);
            }
            else {
                clearSimulation();
                simulate(d);
                clearSubmenu();
            }
            d3.select(d3.event.target.parentNode)
                .classed("selected", true);
        });
}

function showSubmenu(submenuList) {
    let buttonHeight = 40;
    let buttonWidth = 150;
    let body = d3.select("body");
    let menuDiv = body.selectAll("#gui");
    let menuSvg = menuDiv.selectAll(".menuSvg");
    var buttons = menuSvg.selectAll(".subButton")
        .data(submenuList);

    buttons.enter()
        .append("g")
        .attr("class", "button subButton")
        .style("opacity", 0)
        .attr("transform", function(d, i) {
            return ("translate(" + 220 + "," + -50 + ")");
        })
        .transition()
        .duration(800)
        .style("opacity", 1)
        .attr("transform", function(d, i) {
            return ("translate(" + 220 + "," + ((i * buttonHeight) + 10) + ")");
        });

    buttons.append("rect")
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
        .text(function(d) {return d.label;});

    buttons.on("mouseover", function(d) {
        d3.select(d3.event.target.parentNode)
            .classed("highlight", true);
    })
        .on("mouseout", function(d) {
            d3.select(d3.event.target.parentNode)
                .classed("highlight", false);
        })
        .on("click", function(d) {
            d3.selectAll(".subButton.selected")
                .classed("selected", false);
            clearSimulation();
            simulate(d);
            d3.select(d3.event.target.parentNode)
                .classed("selected", true);
        });
}

function hideSubmenu() {
    let buttons = d3.selectAll(".subButton");
    buttons.transition()
        .duration(800)
        .style("opacity", 0)
        .attr("transform", function(d, i) {
                return ("translate(" + 220 + "," + -50 + ")");
            });
}

function clearSubmenu() {
    let buttons = d3.selectAll(".subButton");
    buttons.transition()
        .duration(800)
        .style("opacity", 0)
        .attr("transform", function(d, i) {
                return ("translate(" + 220 + "," + 1000 + ")");
            })
        .remove()
}


function clearSimulation() {
    let simDiv = document.getElementById("sim");
    while (simDiv.firstChild) simDiv.removeChild(simDiv.firstChild);
    let timeDiv = document.getElementById("time");
    while (timeDiv.firstChild) timeDiv.removeChild(timeDiv.firstChild);
    let statDiv = d3.select("#stats").remove();
    cancelAnimationFrame(requestId);
    requestId = undefined;
    window.removeEventListener("resize", onWindowResize);
}

function simulate(systemLabel) {
    system = systemLabel.function(...systemLabel.args);
    bodies = system.bodies;
    if (system.hasOwnProperty("stepsPerFrame")) {
        system.steps = system.stepsPerFrame;
    }
    else { system.steps = 1; }
    timer = new Date(0);
    [spheres] = init();
    animate_leapfrog();

    setURLParameter('s', systemLabel.label);
    window.addEventListener('resize', onWindowResize, true);
}


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(system.camera.x, system.camera.y, system.camera.z);
    scene.add(camera);

    // orbitcontrols
    controls = new OrbitControls(camera);

    // texture loader
    let loader = new THREE.TextureLoader();

    // starfield skymap
    let geometry  = new THREE.SphereGeometry(100000, 32, 32);
    let material  = new THREE.MeshBasicMaterial({
        map: loader.load("textures/galaxy_starfield.png"), side: THREE.BackSide
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
        material.bumpScale = 0.2;
        material.specularMap = b.getSpecularMap();
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(b.r.x, b.r.y, b.r.z);
        scene.add(sphere);
        spheres.push(sphere);
    }

    if (system.sunOn) {
        let sun = spheres[0];
        sun.material.emissive.set(0xCAAA33);
        sun.material.emissiveMap = sun.material.map;

        // sunlight
        let light = new THREE.PointLight(0xfcd440, 2, 8000);
        sun.add(light);

        // sun glow
        let spriteMaterial = new THREE.SpriteMaterial({
            map: loader.load("textures/glow.png"), color: 0xfc843f,
            transparent: false, blending: THREE.AdditiveBlending
        });
        let sprite = new THREE.Sprite(spriteMaterial);
        let glowRadius = sun.geometry.boundingSphere.radius * 3;
        sprite.scale.set(glowRadius, glowRadius, 1.0);
        sun.add(sprite);

        // overall light
        let ambient = new THREE.AmbientLight(0x404040);
        scene.add(ambient);
    }
    else {
        // brighter overall light if no sun
        let ambient = new THREE.AmbientLight(0xf0f0f0);
        scene.add(ambient);
    }

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
    bodies = calc.leapfrog_initial(bodies, system.stepsize);
    requestId = requestAnimationFrame(animate);
}

function animate() {
    timer.setTime(timer.getTime() + (system.stepsize * system.stepsPerFrame * 1000));
    for (let i = 0; i < system.steps; i ++) {
        bodies = calc.leapfrog(bodies, system.stepsize);
    }

    [bodies, spheres] = calc.removeLostBodies(bodies, spheres, scene, system.boundary);

    for (let i = 0; i < bodies.length; i++) {
        let pos = bodies[i].r.clone();

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
                    if (calc.checkBodiesApproach(bodies[i],bodies[j])) {
                        calc.elasticCollision(bodies[i],bodies[j]);
                        // calc.mergeCollision(bodies, spheres, scene, bodies[i], bodies[j]);
                    }
                }
            }
        }
    }
    requestId = requestAnimationFrame(animate);

    // timer
    if (system.counter === "date") {
        let [month, day, year] = timer.toDateString().split(' ').splice(1);
        document.getElementById("time").innerHTML = [day, month, year].join(' ');
    }

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
