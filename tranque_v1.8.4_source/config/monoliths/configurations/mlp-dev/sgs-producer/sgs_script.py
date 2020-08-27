import datetime

SGS_URL = "http://qmonitor.sgs.com//WcfServiceDataQmonitor/DataQmonitor.svc/ServicioDataMLP"


def build_request():
    now = datetime.datetime.now()
    params = {
        "LocUbiNum": "2019",
        "Fec_Desde": now.strftime('%d-%m-%Y'),
        "Fec_Hasta": now.strftime('%d-%m-%Y'),
        "Frecuencia": "H",
    }
    yield (SGS_URL, params, {})


def parse_event(entry, url, params, headers):
    timestamp = datetime.datetime.strptime(entry["Fec_FechaCaptura"], "%d-%m-%Y %H:%M:%S")
    value = entry["Num_ValorValidado"]
    return {
        "@timestamp": timestamp.isoformat(),
        "value": value,
        "name": "el-mauro.none.ef-mvp.m2.parameters.lluvia",
        "meta": {
            "url": url,
            "params": params,
            "headers": headers,
            "originalEntry": entry,
        },
    }


def parse_response(response, *args):
    return [
        parse_event(entry, *args)
        for entry in response.json()
        if entry.get("SrvCod") == "10002241-11"
    ]
