let calc = require("./calc.es6.js");
let Body = calc.Body;
let Vec3 = THREE.Vector3;


function genSolarSystem() {
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
        new Vec3(3.837130288733682E+07, 2.877025350243919E+07, -1.175806982200703E+06),
        new Vec3(-3.878766588423944E+01, 4.109305229662527E+01, 6.918459013107025E+00),
        2439.7E3,
        "mercury",
        new Vec3());

    let venus = new Body(
        4.8675E24,
        new Vec3(-5.377313296255215E+06, -1.085956403911222E+08, -1.164748440839313E+06),
        new Vec3(3.474148284671561E+01, -1.865747137359618E+00, -2.031505677951714E+00),
        6051.8E3,
        "venus",
        new Vec3());

    let earth = new Body(
        5.997219E24,
        new Vec3(-2.700742859439665E+07, 1.446007021429538E+08, 9.687450725421309E+03),
        new Vec3(-2.977044214085218E+01, -5.568042062189587E+00, 3.960050738736065E-04),
        6371E3,
        "earth",
        new Vec3());

    let moon = new Body(
        7.3477E22,
        new Vec3(-2.739180166063208E+07, 1.445252142564551E+08, -5.966407747305930E+03),
        new Vec3(-2.951549140447329E+01, -6.529794009827214E+00, -7.615838122417218E-02),
        1737.1E3,
        "moon",
        new Vec3());

    let mars = new Body(
        6.4171E23,
        new Vec3(1.983824543369704E+08, 7.422924065611902E+07, -3.334840409383859E+06),
        new Vec3(-7.557626093692695E+00, 2.476126524795820E+01, 7.047458490385097E-01),
        3389.5E3,
        "mars",
        new Vec3());

    let jupiter = new Body(
        1.8986E27,
        new Vec3(-7.496501784210088E+08, -3.201712382617047E+08, 1.811158433718784E+07),
        new Vec3(4.982523623046754E+00, -1.141782925514267E+01, -6.466474051600457E-02),
        69911E3,
        "jupiter",
        new Vec3());

    let saturn  = new Body(
        5.6836E26,
        new Vec3(1.082806087546906E+09, 8.510840726181986E+08, -5.793487583371094E+07),
        new Vec3(-6.487121289267689E+00, 7.565952106845154E+00, 1.254418330224025E-01),
        58232E3,
        "saturn",
        new Vec3());

    let uranus = new Body(
        8.681E25,
        new Vec3(-2.724615970786758E+09, -2.894019317704620E+08, 3.428824015831023E+07),
        new Vec3(6.712348901080567E-01, -7.099101277978575E+00, -3.528579247809205E-02),
        25362E3,
        "uranus",
        new Vec3());

    let neptune = new Body(
        1.0243E26,
        new Vec3(-2.328070851258000E+09, -3.891087698123372E+09, 1.337439832412817E+08),
        new Vec3(4.633959234836657E+00, -2.767419818371484E+00, -4.957409060715667E-02),
        24622E3,
        "neptune",
        new Vec3());

    let pluto = new Body(
        1.305E22,
        new Vec3(-4.551131153197412E+09, 3.175396482377141E+08, 1.282172026454296E+09),
        new Vec3(6.354565491262041E-01, -5.762636149150082E+00, 4.409493397386148E-01),
        1186E3,
        "pluto",
        new Vec3());

    return {
        bodies: [sun, mercury, venus, earth, mars, jupiter, saturn, uranus,
                 neptune, pluto]
    };
}

function gen3Bodies() {
    let s1 = new Body(1E19, new Vec3(0, 0, 0), new Vec3(0, 2, 0), 8, "mercury");
    let s2 = new Body(1E18, new Vec3(200, 0, 0), new Vec3(0, 900, 0), 8, "venus");
    let s3 = new Body(1E18, new Vec3(-200, 0, 0), new Vec3(0, -900, 0), 8, "earth");
    let bodies = [s1, s2, s3];
    return bodies;
}
