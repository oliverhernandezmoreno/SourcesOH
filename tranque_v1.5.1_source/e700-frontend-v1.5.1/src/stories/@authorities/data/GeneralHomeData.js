import moment from 'moment';
import {COMMUNES} from 'stories/data/communes';

export const exampleData = [
    { "name": "3 tranques", "state_description": "inactivo", "work_sites": [{"name": "3Tranques", "entity":{"name":"Trapiches"}}],
        "zone": COMMUNES[1], "remote":{"last_seen": moment()}, "canonical_name": "3-tranques"
    },

    { "name": "Monica 1", "state_description": "activo", "work_sites": [{"name": "Planta Tello", "entity":{"name":"Talca Gold"}}],
        "zone": COMMUNES[2], "remote":{"last_seen": moment()}, "canonical_name": "monica-1"
    },

    { "name": "Acopio", "state_description": "abandonado", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[10], "remote": null, "canonical_name": "acopio"
    },

    { "name": "aaaaa", "state_description": "activo", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[30], "remote":{"last_seen": moment()}, "canonical_name": "aaaaa"
    },

    { "name": "BBBB", "state_description": "inactivo", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[99], "remote":{"last_seen": moment()}, "canonical_name": "bbbb"
    },

    { "name": "Ccccc", "state_description": "activo", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[40], "remote": null, "canonical_name": "ccccc"
    },

    { "name": "dddd", "state_description": "inactivo", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[50], "remote": null, "canonical_name": "dddd"
    },

    { "name": "EE", "state_description": "activo", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[60], "remote":{"last_seen": moment()}, "canonical_name": "ee"
    },

    { "name": "ff", "state_description": "activo", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[60], "remote":{"last_seen": moment()}, "canonical_name": "ff"
    },

    { "name": "fff", "state_description": "activo", "work_sites": [{"name": "Desconocido", "entity":{"name":"Desconocido"}}],
        "zone": COMMUNES[70], "remote":{"last_seen": moment()}, "canonical_name": "fff"
    },
];


export const exampleIndexes = [{ "events": [{"value": -1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "3-tranques",
    "name": "Índice de riesgo -- RCA -- Muestreo subterráneo", template_name:".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "3-tranques",
    "name": "Índice de riesgo -- Recreación -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 2}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "3-tranques",
    "name": "Índice de riesgo -- Riego -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0.5}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "3-tranques",
    "name": "Índice de riesgo -- Vida Acuática -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 1.5}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "3-tranques",
    "name": "Índice de riesgo -- Agua Potáble -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "3-tranques",
    "name": "índice de impacto -- Monitoreo subterráneo", template_name: ".ii"
},
{ "events": [{"value": 0.3}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "3-tranques",
    "name": "índice de impacto -- Monitoreo superficial", template_name: ".ii"
},
{ "events": [{"value": 1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "monica-1",
    "name": "Índice de riesgo -- RCA -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 2}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "monica-1",
    "name": "Índice de riesgo -- Recreación -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0.1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "monica-1",
    "name": "Índice de riesgo -- Riego -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 3}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "monica-1",
    "name": "Índice de riesgo -- Vida Acuática -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0.6}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "monica-1",
    "name": "Índice de riesgo -- Agua Potáble -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": -2}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "monica-1",
    "name": "índice de impacto -- Monitoreo subterráneo", template_name: ".ii"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "monica-1",
    "name": "índice de impacto -- Monitoreo superficial", template_name: ".ii"
},
{ "events": [{"value": -0.5}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "acopio",
    "name": "Índice de riesgo -- RCA -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "acopio",
    "name": "Índice de riesgo -- Recreación -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": -1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "acopio",
    "name": "Índice de riesgo -- Riego -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0.3}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "acopio",
    "name": "Índice de riesgo -- Vida Acuática -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": -5}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "acopio",
    "name": "Índice de riesgo -- Agua Potáble -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 1.1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "acopio",
    "name": "índice de impacto -- Monitoreo subterráneo", template_name: ".ii"
},
{ "events": [{"value": -1.1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "acopio",
    "name": "índice de impacto -- Monitoreo superficial", template_name: ".ii"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "aaaaa",
    "name": "Índice de riesgo -- RCA -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "aaaaa",
    "name": "Índice de riesgo -- Recreación -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "aaaaa",
    "name": "Índice de riesgo -- Riego -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "aaaaa",
    "name": "Índice de riesgo -- Vida Acuática -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "aaaaa",
    "name": "Índice de riesgo -- Agua Potáble -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "aaaaa",
    "name": "índice de impacto -- Monitoreo subterráneo", template_name: ".ii"
},
{ "events": [{"value": -1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "aaaaa",
    "name": "índice de impacto -- Monitoreo superficial", template_name: ".ii"
},
{ "events": [{"value": 2}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "bbbb",
    "name": "Índice de riesgo -- RCA -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "bbbb",
    "name": "Índice de riesgo -- Recreación -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": -1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "bbbb",
    "name": "Índice de riesgo -- Riego -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "bbbb",
    "name": "Índice de riesgo -- Vida Acuática -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 1.2}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "bbbb",
    "name": "Índice de riesgo -- Agua Potáble -- Muestreo subterráneo", template_name: ".ir"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "bbbb",
    "name": "índice de impacto -- Monitoreo subterráneo", template_name: ".ii"
},
{ "events": [{"value": 0}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "bbbb",
    "name": "índice de impacto -- Monitoreo superficial", template_name: ".ii"
}
];
