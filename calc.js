let Vec3 = require("three").Vector3;

import Body from "./systems.js";

export const G = 6.67408E-11;


export function accel(i, b) {
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

export function euler(b, h) {
    // b is a list of Body objects
    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let r = b[i].r.clone().add(b[i].v.clone().multiplyScalar(h));
        let v = b[i].v.clone().add(accel(i, b).multiplyScalar(h));
        bodies.push(b[i].clone().set(r, v));
    }

    return bodies;
}

export function symplectic_euler(b, h) {
    // b is a list of Body objects
    let bodies = [];
    for (let i = 0; i < b.length; i++) {
        let v = b[i].v.clone().add(accel(i, b).multiplyScalar(h));
        let r = b[i].r.clone().add(v.clone().multiplyScalar(h));
        bodies.push(b[i].clone().set(r, v));
    }

    return bodies;
}


export function leapfrog_initial(b, h) {
    // kickoff the leapfrog integrator by computing v_{1/2} from v_0
    for (let i = 0; i < b.length; i++) {
        b[i].v.add(accel(i, b).multiplyScalar(.5 * h));
    }

    return b;
}

export function leapfrog(b, h) {
    // leapfrog integration from x_0 and v_{1/2}
    for (let i = 0; i < b.length; i++) {
        b[i].r.add(b[i].v.clone().multiplyScalar(h));
    }

    for (let i = 0; i < b.length; i++) {
        b[i].v.add(accel(i, b).multiplyScalar(h));
    }

    return b;
}

export function getGravCenter(b) {
    let gravCenter = new Vec3(0,0,0);
    let totMass = 0;
    for (let i = 0; i < b.length; i++) {
        gravCenter.add(b[i].r.clone().multiplyScalar(b[i].m));
        totMass += b[i].m;
    }

    return gravCenter.divideScalar(totMass);
}

export function removeLostBodies(b, spheres, scene, range) {
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

export function touch(b1, b2) {
    let distance = new Vec3(0,0,0);
    distance.subVectors(b1.r, b2.r);
    return (distance.length() <= (b1.rad + b2.rad));
}

export function checkBodiesApproach(b1, b2) {
    let relR = new Vec3(0,0,0);
    let relV = new Vec3(0,0,0);
    relR.subVectors(b1.r, b2.r);
    relV.subVectors(b1.v, b2.v);
    return (relV.dot(relR) < 0);
}

export function elasticCollision(b1, b2) {
        let m1 = b1.m, m2 = b2.m,
        v1 = b1.v.clone(), v2 = b2.v.clone(),
        v12 = new Vec3(0,0,0), v21 = new Vec3(0,0,0),
        r1 = b1.r.clone(), r2 = b2.r.clone(),
        r12 = new Vec3(0,0,0), r21 = new Vec3(0,0,0),
        v1new = new Vec3(0,0,0), v2new = new Vec3(0,0,0);

        v12.subVectors(v1, v2);
        v21.subVectors(v2, v1);
        r12.subVectors(r1, r2);
        r21.subVectors(r2, r1);

        v1new.subVectors(v1, r12.multiplyScalar( (v12.dot(r12)/r12.lengthSq()) * (2 * m2 / (m1 + m2)) ) );
        v2new.subVectors(v2, r21.multiplyScalar( (v21.dot(r21)/r21.lengthSq()) * (2 * m1 / (m1 + m2)) ) );

        b1.v = v1new;
        b2.v = v2new;
}

export function mergeCollision(bodies, spheres, scene, b1, b2) {
    let bBig, bSmall;
    if (b1.m > b2.m) {
        bBig = b1, bSmall = b2;
        console.log("merge!");
    }

    else {
        bBig = b2, bSmall = b1;
        console.log("merge!");
    }
    bBig.m += bSmall.m;
    bBig.rad += 2;

    bodies.splice(bodies.indexOf(bSmall),1);
    scene.remove(spheres[bodies.indexOf(bSmall)]);
    spheres.splice(bodies.indexOf(bSmall),1);
    console.log("merge!");
}
