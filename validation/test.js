import * as systems from "./../systems.js";
import * as calc from "./../calc.js";


function SolarSystem() {
    // get positions of the bodies in the solar system at the beginning of
    // each year from 1970 to 2015, used to compare with data from NASA
    let system = systems.genSolarSystem();
    let bodies = system.bodies;
    let timer = new Date(0);
    let years = 2015 - 1970 + 1;

    // get unix times at midnight January 1st for all years
    let times = [];
    let t = new Date(0);
    for (let i = 0; i < years; i ++) {
        times.push(t.getTime());
        t.setFullYear(t.getFullYear() + 1);
    }

    // override stepsize
    system.stepsize = 60 * 60 * 12;

    // kickoff leapfrog
    bodies = calc.leapfrog_initial(bodies, system.stepsize);

    let num_steps = Math.round((60 * 60 * 24) * 365 * years / system.stepsize);

    let results = {};
    for (let b of bodies) {
        results[b.texture] = {};
    }

    let year = 1970;
    for (let i = 0; i < num_steps; i++) {
        if (times.indexOf(timer.getTime()) > -1) {
            for (let b of bodies) {
                results[b.texture][year] = {
                    "position": [b.r.x, b.r.y, b.r.z]
                    // "velocity": [b.v.x, b.v.y, b.v.z]
                };
            }
            console.log(year);
            year++;
        }
        bodies = calc.leapfrog(bodies, system.stepsize);
        timer.setTime(timer.getTime() + system.stepsize * 1E3);
    }

    document.write(JSON.stringify(results));
}

SolarSystem();
