import datetime
import re
import logging

logger = logging.getLogger("demo_script_multiple")

DGA_URL = "http://dgasatel.mop.cl/consulta_auto_dato.asp"

stations = {
    "04810001-5": "DGA1",
    "04810005-8": "DGA2",
}

templates = {
    "1": "emac-mvp.sgt.nf",
    "3": "emac-mvp.sgt.precipitacion-acumulada",
    "12": "emac-mvp.sgt.caudal",
    "13": "emac-mvp.sgt.precipitacion-instantanea",
    "27": "emac-mvp.sgt.ph",
    "28": "emac-mvp.sgt.ce",
    "31": "emac-mvp.sgt.turbiedad",
    "32": "emac-mvp.sgt.t",
    "33": "emac-mvp.sgt.oxigeno-disuelto",
    "34": "emac-mvp.sgt.oxigeno-disuelto-ppm",
}


def build_request():
    for station in stations:
        for key in templates:
            yield (DGA_URL, {"id_estacion": station, "parametro": key}, {})


match_response = re.compile("<html>(.*)</html>", re.S).search


def parse_response(response, url, params, headers):
    logger.debug(f"Response: {repr(response.text)}")
    parsed = match_response(response.text)
    if parsed is None:
        return []
    data = parsed.groups()[0].strip()
    if not data:
        return []
    timestamp, value = data.rsplit(" ", 1)
    try:
        value = float(value)
        timestamp = datetime.datetime.strptime(timestamp, "%m/%d/%Y %I:%M:%S %p")
    except Exception:
        return []
    return [{
        "@timestamp": timestamp.isoformat(),
        "value": value,
        "name": f"el-mauro.s-{stations[params['id_estacion']]}.{templates[params['parametro']]}",
        "meta": {
            "url": url,
            "params": params,
            "headers": headers,
            "originalResponse": data,
        }
    }]
