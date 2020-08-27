import datetime
import random
import sys

POINTS = [
    f"PUNTO-{subsup}-{updown}-{index}"
    for subsup in ("SUB", "SUP")
    for updown in ("ARRIBA", "ABAJO")
    for index in (1, 2)
]

# variable suffix -> (mean, std, min, max)
VARIABLES = {
    "variables.al": (0.327966101694915, 2, 0, None),
    "variables.as": (0.04967521367521367, 0.5, 0, None),
    "variables.be": (0.22074074074074077, 2, 0, None),
    "variables.b": (3.5248863636363637, 1, 0, None),
    "variables.cd": (0.698125, 2, 0, None),
    "variables.ce": (449.4191428571429, 200, 0, 3000),
    "variables.chloride": (7.6854261363636365, 7, 0, None),
    "variables.co": (0.010429799426934097, 0.005, 0, None),
    "variables.cr": (0.010086206896551724, 0.001, 0, None),
    "variables.cu": (0.01410919540229885, 0.02, 0, None),
    "variables.cyanide": (0.05, 0, 0, None),
    "variables.fe": (0.11170028818443803, 0.4, 0, None),
    "variables.fluoride": (0.08054597701149425, 0.08, 0, None),
    "variables.hg": (0.0005, 0, 0, None),
    "variables.mn": (0.021461988304093568, 0.03, 0, None),
    "variables.mo": (0.005357348703170029, 9.5, 0, None),
    "variables.ni": (0.01017241379310345, 0.002, 0, None),
    "variables.pb": (0.01, 0, 0, None),
    "variables.ph": (7.626314285714286, 0.65, 1, 14),
    "variables.sb": (0.01, 0, 0, None),
    "variables.se": (0.001, 0, 0, None),
    "variables.sulfates": (46.307556818181816, 30, 0, None),
    "variables.zn": (0.011580459770114944, 0.01, 0, None),
    "ionic-balance.bicarbonates": (232.37838616714697, 62, 0, 600),
    "ionic-balance.carbonates": (1.1463976945244958, 3.8, 0, None),
    "ionic-balance.k": (1.8305865102639296, 1.2, 0, None),
    "ionic-balance.mg": (18.79377581120944, 4.5, 0, None),
    "ionic-balance.na": (19.980615835777126, 6, 0, None),
    # Calcium will be generated to achieved a low-enough BI
    # "ionic-balance.ca": (52.490497076023395, 15, 0, None),
}

START_YEAR = 2015
MONTHS = 50


def output_line(timestamp, point, variable, value):
    print(f"{timestamp}Z\t__REPLACED_TARGET__.s-{point}.emac-mvp.{variable}\t{value}")


def generate_value(mean, std, minimum=None, maximum=None):
    max_tries = 100000
    tries = 0
    value = random.normalvariate(mean, std)
    while (minimum is not None and value < minimum) or \
          (maximum is not None and value > maximum):
        value = random.normalvariate(mean, std)
        tries += 1
        if tries > max_tries:
            raise RuntimeError(f"random value couldn't be generated: ({mean}, {std}, {minimum}, {maximum})")
    return value


bad_samples = 0

for index in range(MONTHS):
    for point in POINTS:
        values = {}
        for variable, (mean, std, minimum, maximum) in VARIABLES.items():
            day = int(random.random() * 27) + 1
            month = (index % 12) + 1
            year = START_YEAR + (index // 12)
            timestamp = datetime.datetime(year, month, day, 12).isoformat()
            value = generate_value(mean, std, minimum, maximum)
            values[variable] = value
            output_line(timestamp, point, variable, value)

        cat_sum = sum([
            values["ionic-balance.na"] * 1 / 22.99,
            values["ionic-balance.k"] * 1 / 39.098,
            values["ionic-balance.mg"] * 2 / 24.305,
        ])
        an_sum = sum([
            values["ionic-balance.carbonates"] * 2 / 60.008,
            values["ionic-balance.bicarbonates"] * 1 / 61.016,
            values["variables.sulfates"] * 2 / 96.056,
            values["variables.chloride"] * 1 / 35.45,
        ])
        day = int(random.random() * 27) + 1
        month = (index % 12) + 1
        year = START_YEAR + (index // 12)
        timestamp = datetime.datetime(year, month, day, 12).isoformat()
        mean, std = 52, 15
        maximum = (1.1 * an_sum - 0.9 * cat_sum) / 0.9 * 40.078 / 2
        if maximum < 0:
            bad_samples += 1
            value = generate_value(mean, std)
            output_line(timestamp, point, "ionic-balance.ca", value)
        else:
            value = generate_value(mean, std, maximum=maximum)
            output_line(timestamp, point, "ionic-balance.ca", value)

print("BAD SAMPLES", bad_samples, file=sys.stderr)
