// physical constants from http://physics.nist.gov/cuu/Constants/index.html
let G = 6.67408E-11;

let Vec3 = THREE.Vector3;

class Body {
    constructor(m, r, v) {
        this.m = m;
        this.r = r;
        this.v = v;
    }

    set(r, v) {
        this.r = r;
        this.v = v;
    }

    clone() {
        return new Body(this.m, this.r, this.v);
    }

}

let sun = new Body(1.98855E30,
                   new Vec3(0, 0, 0),
                   new Vec3(0, 0, 0));
let earth = new Body(5.997219E24,
                     new Vec3(-147.09E3, 0, 0),
                     new Vec3(0 , 30.29E3, 0));
// let bodies = [sun, earth];

let s1 = new Body(1E19, new Vec3(0, 0, 0), new Vec3(0, 2, 0));
let s2 = new Body(1E18, new Vec3(200, 0, 0), new Vec3(0, 900, 0));
let s3 = new Body(1E18, new Vec3(-200, 0, 0), new Vec3(0, -900, 0));
let bodies = [s1, s2, s3];

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

    bodies = [];
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

    bodies = [];
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

    bodies = [];
    for (let i = 0; i < b.length; i++) {
        let v = b[i].v.clone().add(accel(i).multiplyScalar(.5*h));
        bodies.push(new Body(b[i].m, b[i].r, v));
    }

    return bodies;
}

module.exports = {
    bodies: bodies,
    symplectic_euler: symplectic_euler,
    leapfrog: leapfrog
};
