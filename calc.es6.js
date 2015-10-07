// physical constants from http://physics.nist.gov/cuu/Constants/index.html

let G = 6.67408E-11;

let Vec3 = THREE.Vector3;

class Body {
    constructor(m, r, v, texture) {
        this.m = m;
        this.r = r;
        this.v = v;
        this.texture = texture
    }

    set(r, v) {
        this.r = r;
        this.v = v;
    }

    clone() {
        return new Body(this.m, this.r, this.v, this.texture);
    }

}

// let sun = new Body(1.98855E30,
//                    new Vec3(0, 0, 0),
//                    new Vec3(0, 0, 0));
// let earth = new Body(5.997219E24,
//                      new Vec3(-147.09E3, 0, 0),
//                      new Vec3(0 , 30.29E3, 0));
// let bodies = [sun, earth];
// let loader = THREE.ImageUtils.loadTexture();
let loader = THREE.ImageUtils;
let allTextures = [loader.loadTexture("textures/jupiter.jpg"), loader.loadTexture("textures/mercury.jpg"), loader.loadTexture("textures/moon.jpg")]


let s1 = new Body(1E19, new Vec3(0, 0, 0), new Vec3(0, 2, 0), allTextures[0]);
let s2 = new Body(1E18, new Vec3(200, 0, 0), new Vec3(0, 900, 0), allTextures[1]);
let s3 = new Body(1E18, new Vec3(-200, 0, 0), new Vec3(0, -900, 0), allTextures[2]);
let bodies = [s1, s2, s3];
// bodies = [];

function genBodies(n) {
    let bodies = [];



    bodies.push(new Body(1E18, new Vec3(0, 0, 0), new Vec3(0, 0, 0)));
    for (let i = 0; i < n; i++) {
        bodies.push(new Body(1E16, 
            new Vec3(getRandomInt(-300,300), getRandomInt(-300,300), getRandomInt(-300,300)), 
            new Vec3(getRandomInt(-900,900), getRandomInt(-900,900), getRandomInt(-900,900)),
            allTextures[getRandomInt(0, allTextures.length)]
            )
        )
    }
    
    return bodies
}




function euler(b, h) {
    // b is a list of Body objects

    function accel(i) {
        // Compute acceleration on body i by all other bodies
        let a = new Vec3(0, 0, 0);
        for (let j = 0; j < b.length; j++) {
            // compute the acceleration vector for body i due to body j
            if (j === i) {
                continue;
            }
            // Compute distance vector between the i-th and j-th body
            let v = b[j].r.clone().sub(b[i].r);
            // Compute the scalar part of the newtonian accelleration
            let s = G * b[j].m / Math.pow(v.length(), 3);
            a.add(v.multiplyScalar(s));
        }
        return a;
    }

    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let r = b[i].r.clone().add(b[i].v.clone().multiplyScalar(h));
        let v = b[i].v.clone().add(accel(i).multiplyScalar(h));
        bodies.push(new Body(b[i].m, r, v));
    }

    return bodies;
}

function symplectic_euler(b, h) {
    // b is a list of Body objects

    function accel(i) {
        // Compute acceleration on body i by all other bodies
        let a = new Vec3(0, 0, 0);
        for (let j = 0; j < b.length; j++) {
            if (j === i) {
                continue;
            }
            let v = b[j].r.clone().sub(b[i].r);
            let s = G * b[j].m / Math.pow(v.length(), 3);
            a.add(v.multiplyScalar(s));
        }
        return a;
    }

    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let v = b[i].v.clone().add(accel(i).multiplyScalar(h));
        let r = b[i].r.clone().add(v.clone().multiplyScalar(h));
        bodies.push(new Body(b[i].m, r, v));
    }

    return bodies;
}


function leapfrog(b, h) {
    
    function accel(i) {
        // Compute acceleration on body i by all other bodies
        let a = new Vec3(0, 0, 0);
        for (let j = 0; j < b.length; j++) {
            if (j === i) {
                continue;
            }
            let v = b[j].r.clone().sub(b[i].r);
            let s = G * b[j].m / Math.pow(v.length(), 3);
            a.add(v.multiplyScalar(s));
        }
        return a;
    }

    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let r = b[i].r.clone().add(b[i].v.clone().multiplyScalar(h));
        let v = b[i].v.clone().add(accel(i).multiplyScalar(.5*h));
        bodies.push(new Body(b[i].m, r, v));
    }

    return bodies;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}                               // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

module.exports = {
    bodies: bodies,
    genBodies: genBodies,
    symplectic_euler: symplectic_euler,
    leapfrog: leapfrog
};
