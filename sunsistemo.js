'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var scene = undefined,
    camera = undefined,
    renderer = undefined;
var controls = undefined,
    stats = undefined;

var calc = require("./calc.es6.js");

var bodies = calc.bodies;

var _init = init();

var _init2 = _slicedToArray(_init, 1);

var spheres = _init2[0];

animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    // orbitcontrols
    controls = new THREE.OrbitControls(camera);
    controls.damping = 0.1;
    controls.addEventListener('change', render);

    // spheres
    var spheres = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = bodies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var b = _step.value;

            var geometry = new THREE.SphereGeometry(20, 32, 32);
            var material = new THREE.MeshNormalMaterial();
            var sphere = new THREE.Mesh(geometry, material);

            sphere.position.set(b.r.x, b.r.y, b.r.z);
            scene.add(sphere);
            spheres.push(sphere);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
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

function animate() {
    bodies = calc.symplectic_euler(bodies, 0.001);

    for (var i = 0; i < bodies.length; i++) {
        var pos = bodies[i].r;
        spheres[i].position.set(pos.x, pos.y, pos.z);
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
