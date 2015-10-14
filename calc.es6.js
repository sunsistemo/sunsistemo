// physical constants from http://physics.nist.gov/cuu/Constants/index.html
let G = 6.67408E-11;

let Vec3 = THREE.Vector3;
let planets = ["earth", "jupiter", "mars", "mercury", "moon", "neptune",
               "pluto", "saturn", "uranus", "venus"];
let balls = ["tennisball", "softball"];
let textures = ["sun", "earth", "jupiter", "mars", "mercury", "moon", "neptune",
                "pluto", "saturn", "uranus", "venus", "clouds", "tennisball"];
let allTextures = {};

allTextures = { "sun":     loadTextures("sun", true, false, false),
                "mercury": loadTextures("mercury", true, true,  false),
                "venus":   loadTextures("venus", true, true,  false),
                "earth":   loadTextures("earth", true, true, true),
                "mars":    loadTextures("mars", true, true,  false),
                "moon":    loadTextures("moon", true, true,  false),
                "jupiter": loadTextures("jupiter", true, false, false),
                "saturn":  loadTextures("saturn", true, false, false),
                "uranus":  loadTextures("uranus", true, false, false),
                "neptune": loadTextures("neptune", true, false, false),
                "pluto":   loadTextures("pluto", true, true,  false),
                "tennisball": loadTextures("tennisball", true, true, true),
                "softball": loadTextures("softball", true, true, false)
};


class Body {
    constructor(m, r, v, rad, texture, rot) {
        this.m = m;
        this.r = r;
        this.v = v;
        this.rad = rad;
        this.texture = texture;
        this.rot = rot;
    }

    getTexture() {
        return allTextures[this.texture]["texture"];
    }

    getBumpMap() {
        return allTextures[this.texture]["bumpMap"];
    }
    getSpecularMap() {
        return allTextures[this.texture]["specularMap"];
    }

    set(r, v) {
        this.r = r;
        this.v = v;
        return this;
    }

    clone() {
        return new Body(this.m, this.r, this.v, this.rad, this.texture, this.rot);
    }
}

function loadTextures(textureName, textOn, bumpOn, specOn){
    let fullTexture = {};
    if (textOn) {
        let texture = THREE.ImageUtils.loadTexture("textures/" + textureName + "map.jpg" );
        texture.minFilter = THREE.LinearFilter;
        fullTexture.texture = texture;
    }
    if (bumpOn) {
        let bumpMap = THREE.ImageUtils.loadTexture("textures/" + textureName + "bump.jpg");
        bumpMap.minFilter = THREE.LinearFilter;
        fullTexture.bumpMap = bumpMap;
    }
    if (specOn) {
        let specularMap = THREE.ImageUtils.loadTexture("textures/" + textureName + "specular.jpg");
        specularMap.minFilter = THREE.LinearFilter;
        fullTexture.specularMap = specularMap;
    }

    return fullTexture;
}

function getRandomFromList(list) {

    return list[getRandomInt(0, list.length)];
}

function genBodies(n, bodyTexture) {

    if (!bodyTexture){allTextures = [];}
    let bodies = [];

    bodies.push(new Body(1E18, new Vec3(0, 0, 0), new Vec3(0, 0, 0)));
    for (let i = 0; i < n; i++) {
        bodies.push(new Body(
            5E16,
            new Vec3(getRandomInt(-300,300), getRandomInt(-300,300), getRandomInt(-300,300)),
            new Vec3(getRandomInt(-900,900), getRandomInt(-900,900), getRandomInt(-900,900)),
            getRandomFromList(planets)
        ));
    }

    return {
        bodies: bodies,
        stepsize: 0.001,
        camera: {x: 0, y: 0, z: 400}
    };
}

function genBodiesRot(n, bodyTexture) {
    if (!bodyTexture){allTextures = [];}
    let bodies = [];

    let angMomVec = new Vec3(0,4,0);

    bodies.push(new Body(1E18, new Vec3(0, 0, 0), new Vec3(0, 0, 0), 16, "sun",
                         new Vec3(0, 0.01, 0)));
    for (let i = 0; i < n; i++) {
        let posVec = new Vec3(getRandomInt(-300,300), getRandomInt(-300,300), getRandomInt(-300,300));
        let velVec = new Vec3(0,0,0);
        let rot = () => Math.random() / 30;
        let rotation = new Vec3(0, rot(), 0);
        velVec.crossVectors(posVec, angMomVec).multiplyScalar(Math.random());
        bodies.push(new Body(5E13, posVec, velVec, 8, getRandomFromList(balls), rotation));
    }

    return {
        bodies: bodies,
        stepsize: 0.001,
        camera: {x: 0, y: 0, z: 400}
    };
}

function accel(i, b) {
    // Compute acceleration due to gravity on body i by all other bodies
    let a = new Vec3(0, 0, 0);
    for (let j = 0; j < b.length; j++) {
        // compute the acceleration vector for body i due to body j
        if (j === i) {
            continue;
        }
        // Compute distance vector between the i-th and j-th body
        let v = b[j].r.clone().sub(b[i].r);
        // Compute the scalar part of the Newtonian acceleration
        let s = G * b[j].m / Math.pow(v.length(), 3);
        a.add(v.multiplyScalar(s));
    }
    return a;
}

function euler(b, h) {
    // b is a list of Body objects
    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let r = b[i].r.clone().add(b[i].v.clone().multiplyScalar(h));
        let v = b[i].v.clone().add(accel(i, b).multiplyScalar(h));
        bodies.push(b[i].clone().set(r, v));
    }

    return bodies;
}

function symplectic_euler(b, h) {
    // b is a list of Body objects
    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let v = b[i].v.clone().add(accel(i, b).multiplyScalar(h));
        let r = b[i].r.clone().add(v.clone().multiplyScalar(h));
        bodies.push(b[i].clone().set(r, v));
    }

    return bodies;
}


function leapfrog(b, h) {
    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let r = b[i].r.clone().add(b[i].v.clone().multiplyScalar(h));
        let v = b[i].v.clone().add(accel(i, b).multiplyScalar(.5*h));
        bodies.push(b[i].clone().set(r, v));
    }

    return bodies;
}

function getGravCenter(b) {
    let gravCenter = new Vec3(0,0,0);
    let totMass = 0;
    for (let i = 0; i < b.length; i++) {
        gravCenter.add(b[i].r.clone().multiplyScalar(b[i].m));
        totMass += b[i].m;
    }

    return gravCenter.divideScalar(totMass);
}

function removeLostBodies(b, spheres, scene, range){
    let gravCent = getGravCenter(b);
    for (let i = 0; i < b.length; i++) {
        let pos = b[i].r.clone();
        let gravCBodyDist = new Vec3(0, 0, 0);
        gravCBodyDist.subVectors(pos, gravCent);

        if (gravCBodyDist.length() > range) {
            b.splice(i,1);
            scene.remove(spheres[i]);
            spheres.splice(i,1);
        }
    }
    return [b, spheres];
}

function touch(b1, b2) {
    let distance = new Vec3(0,0,0);
    distance.subVectors(b1.r, b2.r);
    return (distance.length() <= (b1.rad + b2.rad))
}

function elasticCollision(b1, b2) {
    let normal = new Vec3(0,0,0);
    normal.subVectors(b1.r, b2.r);
    console.log(b1.texture,b2.texture);
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}                               // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

module.exports = {
    touch: touch,
    elasticCollision: elasticCollision,
    removeLostBodies: removeLostBodies,
    getGravCenter: getGravCenter,
    genBodies: genBodies,
    genBodiesRot: genBodiesRot,
    symplectic_euler: symplectic_euler,
    leapfrog: leapfrog
};
