import json
from telnetlib import Telnet


def get_solar_system_data():
    """Gets position and velocity data for bodies in the solar system every year
    from 1970-01-01 to 2015 from NASA's HORIZONS system and saves it to a json
    file.
    """
    bodies = {                      # ID's of bodies in the HORIZONS system
        "mercury": "199",
        "venus": "299",
        "moon": "301",
        "earth": "399",
        "mars": "499",
        "jupiter": "599",
        "saturn": "699",
        "uranus": "799",
        "neptune": "899",
        "pluto": "999"
    }

    data = {}
    for body in bodies.keys():
        print "Getting data for %s" % body
        data[body] = get_data(bodies[body])

    with open("solar_system.json", 'w') as f:
        json.dump(data, f)


def get_data(body_id):
    """Get position and velocity of body from NASA's horizon system"""
    tn = Telnet("horizons.jpl.nasa.gov", 6775)

    def write(message):
        tn.write(message + '\n')

    tn.read_until("Horizons> ")
    write(body_id)                  # choose major body

    tn.read_until("<cr>: ")
    write('E')                      # request ephemeris

    tn.read_until(" : ")
    write('v')                      # choose vectors

    tn.read_until(" : ")
    write("500@10")                 # coordinate center at the sun

    tn.read_until("--> ")
    write("y")                      # confirm coordinate center

    tn.read_until(" : ")
    write("eclip")                  # ecliptic coordinate system

    tn.read_until(" : ")
    write("1970-01-01")             # starting time: 1970-01-01

    tn.read_until(" : ")
    write("2015-01-01")             # end time in 2015

    tn.read_until(" : ")
    write("1y")                     # output interval

    tn.read_until(" : ")
    write("n")                      # choose other options

    tn.read_until(" : ")
    write("J2000")                  # output reference frame

    tn.read_until(" : ")
    write("1")                      # no corrections

    tn.read_until(" : ")
    write("1")                      # units in km/s

    tn.read_until(" : ")
    write("YES")                    # use CSV format

    tn.read_until(" : ")
    write("NO")                     # no output labels

    tn.read_until(" : ")
    write("2")                      # request x, y, z, vx, vy, vz values

    tn.read_until("$$SOE")
    data = tn.read_until("$$EOE")
    tn.close()

    data = data[:-5].strip().splitlines()          # split lines into years
    data = [y[:-1].split(", ")[2:] for y in data]  # extract values
    data = [[float(e) * 1E3 for e in y] for y in data]  # convert to meters

    body = {}
    year = 1970
    for d in data:
        x, y, z, vx, vy, vz = d
        body[year] = {"position": [x, y, z], "velocity": [vx, vy, vz]}
        year += 1

    return body


if __name__ == '__main__':
    get_solar_system_data()
