let scene, camera, light, renderer;
let controls, stats;

let calc = require("./calc.es6.js");

let bodyTexture = true;
let system = calc.genBodiesRot(400, bodyTexture);
let bodies = system.bodies;
let sphereP = 32;
let [spheres] = init();


animate();


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(system.camera.x, system.camera.y, system.camera.z);
    scene.add(camera);

    // orbitcontrols
    controls = new THREE.OrbitControls(camera);
    controls.damping = 0.1;
    controls.addEventListener('change', render);

    // starfield skymap
    let geometry  = new THREE.SphereGeometry(10000, 32, 32);
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
        material.bumpScale = 0.2;
        material.specularMap = b.getSpecularMap();
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(b.r.x, b.r.y, b.r.z);
        scene.add(sphere);
        spheres.push(sphere);
    }

    // sun
    let light = new THREE.PointLight(0xfcd440, 2);
    spheres[0].add(light);

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
    bodies = calc.symplectic_euler(bodies, system.stepsize);
    [bodies, spheres] = calc.removeLostBodies(bodies, spheres, scene, 2000);

    for (let i = 0; i < bodies.length; i++) {
        let pos = bodies[i].r;
        spheres[i].position.set(pos.x, pos.y, pos.z);
        spheres[i].rotation.x += bodies[i].rot.x;
        spheres[i].rotation.y += bodies[i].rot.y;
        spheres[i].rotation.z += bodies[i].rot.z;
    }

    requestAnimationFrame(animate);
    render();
    stats.update();
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
window.addEventListener('resize', onWindowResize, true);


function render() {
    renderer.render(scene, camera);
}
