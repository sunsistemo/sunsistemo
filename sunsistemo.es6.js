let scene, camera, light, renderer;
let controls, stats;

import Body from "./calc.es6.js";
import * as systems from "./systems.es6.js";
import * as calc from "./calc.es6.js";

let bodyTexture = true;
let numBodies = 100;
let sphereP = 32;

let system
// let system = systems.genBodiesRot(numBodies, bodyTexture);
let bodies;
let spheres;
let sysDict = {
    "Random Bodies": systems.genBodies , 
    "Solar System": systems.genSolarSystem, 
    "Total Angular Momentum": systems.genBodiesRot,
    "Three Bodies": systems.gen3Bodies
};
var steps;

simulate("Random Bodies")


function simulate(sysID){
    let sysFunc = sysDict[sysID];
    system = sysFunc(numBodies, bodyTexture)
    bodies = system.bodies;
    if (system.hasOwnProperty("stepsPerFrame")) {
        steps = system.stepsPerFrame;
    } else {
        steps = 1;
    }
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
        let geometry = new THREE.SphereGeometry(b.rad, sphereP, sphereP);
        let material = new THREE.MeshPhongMaterial();
        material.map = b.getTexture();
        material.bumpMap = b.getBumpMap();
        material.bumpScale = 0.05;
        material.specularMap = b.getSpecularMap();
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(b.r.x, b.r.y, b.r.z);
        scene.add(sphere);
        spheres.push(sphere);
    }

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

    // overall light
    let ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
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

        for (let j = i + 1; j < bodies.length; j++) {
            if ((i !== j) && (calc.touch(bodies[i],bodies[j]))) {
                spheres[i].texture
                calc.elasticCollision(bodies[i],bodies[j]);
                // calc.mergeCollision(bodies, spheres, scene, bodies[i], bodies[j]);

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
