import Body from "./calc.es6.js";
import * as calc from "./calc.es6.js";
let Vec3 = THREE.Vector3;


export function genSolarSystem() {
    // Initial conditions of the solar system at 00:00:00 1 January 1970

    let sun = new Body(
        1.98855E30,
        new Vec3(0, 0, 0),
        new Vec3(0, 0, 0),
        696342E3,
        "sun",
        new Vec3());

    let mercury = new Body(
        3.3011E23,
        new Vec3(3.837130288733682E+10, 2.877025350243919E+10, -1.175806982200703E+09),
        new Vec3(-3.878766588423944E+04, 4.109305229662527E+04, 6.918459013107025E+03),
        2439.7E3,
        "mercury",
        new Vec3());

    let venus = new Body(
        4.8675E24,
        new Vec3(-5.377313296255215E+09, -1.085956403911222E+11, -1.164748440839313E+09),
        new Vec3(3.474148284671561E+04, -1.865747137359618E+03, -2.031505677951714E+03),
        6051.8E3,
        "venus",
        new Vec3());

    let earth = new Body(
        5.997219E24,
        new Vec3(-2.700742859439665E+10, 1.446007021429538E+11, 9.687450725421309E+06),
        new Vec3(-2.977044214085218E+04, -5.568042062189587E+03, 3.960050738736065E-01),
        6371E3,
        "earth",
        new Vec3());

    let moon = new Body(
        7.3477E22,
        new Vec3(-2.739180166063208E+10, 1.445252142564551E+11, -5.966407747305930E+06),
        new Vec3(-2.951549140447329E+04, -6.529794009827214E+03, -7.615838122417218E+01),
        1737.1E3,
        "moon",
        new Vec3());

    let mars = new Body(
        6.4171E23,
        new Vec3(1.983824543369704E+11, 7.422924065611902E+10, -3.334840409383859E+09),
        new Vec3(-7.557626093692695E+03, 2.476126524795820E+04, 7.047458490385097E+02),
        3389.5E3,
        "mars",
        new Vec3());

    let jupiter = new Body(
        1.8986E27,
        new Vec3(-7.496501784210088E+11, -3.201712382617047E+11, 1.811158433718784E+10),
        new Vec3(4.982523623046754E+03, -1.141782925514267E+04, -6.466474051600457E+01),
        69911E3,
        "jupiter",
        new Vec3());

    let saturn  = new Body(
        5.6836E26,
        new Vec3(1.082806087546906E+12, 8.510840726181986E+11, -5.793487583371094E+10),
        new Vec3(-6.487121289267689E+03, 7.565952106845154E+03, 1.254418330224025E+02),
        58232E3,
        "saturn",
        new Vec3());

    let uranus = new Body(
        8.681E25,
        new Vec3(-2.724615970786758E+12, -2.894019317704620E+11, 3.428824015831023E+10),
        new Vec3(6.712348901080567E+02, -7.099101277978575E+03, -3.528579247809205E+01),
        25362E3,
        "uranus",
        new Vec3());

    let neptune = new Body(
        1.0243E26,
        new Vec3(-2.328070851258000E+12, -3.891087698123372E+12, 1.337439832412817E+11),
        new Vec3(4.633959234836657E+03, -2.767419818371484E+03, -4.957409060715667E+01),
        24622E3,
        "neptune",
        new Vec3());

    let pluto = new Body(
        1.305E22,
        new Vec3(-4.551131153197412E+12, 3.175396482377141E+11, 1.282172026454296E+12),
        new Vec3(6.354565491262041E+02, -5.762636149150082E+03, 4.409493397386148E+02),
        1186E3,
        "pluto",
        new Vec3());

    // let bodies = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus,
    //               neptune, pluto];
    let bodies = [sun, mercury, venus, earth];

    let scaleRadius = rad => Math.pow(rad, 1/5);

    for (let b of bodies) {
        b.rad = scaleRadius(b.rad);
    }

    return {
        bodies: bodies,
        // stepsize: 10000. * (60 * 60 * 24),
        stepsize: 10,
        stepsPerFrame: 1,
        // scalePosition: vec => vec.multiplyScalar(1E-08),
        scalePosition: vec => vec.setLength(Math.pow(vec.length(), 1/6)),
        // scalePosition: vec => vec.setLength(Math.log(vec.length)/Math.log(1.4)),
        camera: {x: 0, y: 0, z: 1300}
    };
}

export function gen3Bodies() {
    let s1 = new Body(1E19, new Vec3(0, 0, 0), new Vec3(0, 2, 0), 8, "mercury");
    let s2 = new Body(1E18, new Vec3(200, 0, 0), new Vec3(0, 900, 0), 8, "venus");
    let s3 = new Body(1E18, new Vec3(-200, 0, 0), new Vec3(0, -900, 0), 8, "earth");
    let bodies = [s1, s2, s3];

    return {
        bodies: bodies,
        stepsize: 0.001,
        camera: {x: 0, y: 0, z: 400}
    };
}
