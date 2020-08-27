import moment from 'moment';

const baseLat = -31.9;
const baseLng = -71.0;
const states = ['activo', 'inactivo', 'abandonado'];
const remotes = [
    {
        namespace: 'sml-inria',
        last_seen: moment().toISOString(),
        lastSeen: moment().toISOString()
    }, {
        namespace: 'sml-inria',
        last_seen: moment().subtract(3, 'months').toISOString(),
        lastSeen: moment().subtract(3, 'months')
    }, {
        namespace: 'sml-inria',
        last_seen: null,
        lastSeen: moment(null)
    }
];
const ticketLevels = [
    {level: 1, state: 'A'}, {level: 2, state: 'B'}, {level: 3, state: 'C'}, {level: 4, state: 'D'},
    {level: 5, state: 'YELLOW'}, {level: 6, state: 'RED'}
];

function generateTickets(i, j, target, profile) {
    const ticketLevel = ticketLevels[Math.floor(Math.random() * 6)];
    return {
        "id": `random-id-${i}-${j}`,
        "target": {
            "canonical_name": target
        },
        "module_name": `test module name ${i}.${j}`,
        "created_at": "2020-01-16T18:00:09.887489Z",
        "updated_at": "2020-03-20T16:00:13.454886Z",
        "module": `_.${profile}.test.module.name.${i}.${j}`,
        "state": ticketLevel.state,
        "result_state": {
            "level": ticketLevel.level,
            "message": `test module name ${i}.${j}`,
            "short_message": `test module name ${i}.${j}`
        },
        "close_conditions": [],
        "archive_conditions": [],
        "spread_object": null,
        "archived": false,
        "evaluable": true,
        "base_module": `${profile}.test.module.name.${i}.${j}`
    };
}

function generateTimeseries(i, j, target, value) {
    const canonicalName = `test.frontend.index.${i}.${j}`;
    return {
        'id': `random-id-${i}-${j}`,
        'events': value !== null ? [
            {
                '@timestamp': '2019-07-30T03:00:00+00:00',
                'meta': {},
                'name': canonicalName,
                'value': value,
                'labels': [],
                '_id': 'id random?'
            }
        ] : [],
        'thresholds': [
            {
                'upper': '0.00000000',
                'lower': null,
                'kind': null
            }
        ],
        'unit': null,
        'acquired_protocols': [],
        'frequencies': [],
        'category': [
            'emac-index'
        ],
        'target_canonical_name': target,
        'data_source': null,
        'data_source_group': {
            'id': 'random id',
            'target': target,
            'name': 'Muestreo subterráneo',
            'canonical_name': 'subterraneo',
            'meta': null
        },
        'name': 'Índice de riesgo -- Agua Potable -- Muestreo subterráneo',
        'canonical_name': canonicalName,
        'template_name': 'test.frontend',
        'description': null,
        'highlight': true,
        'active': true,
        'type': 'derived',
        'space_coords': null,
        'labels': [],
        'choices': null,
        'script': '',
        'script_version': 'emac:front-test',
        'range_gte': null,
        'range_gt': null,
        'range_lte': null,
        'range_lt': null,
        'target': target,
        'inputs': []
    };
}

function generateTarget(i) {
    const lat = baseLat + 0.01 * i - 0.05;
    const lng = baseLng + 0.01 * i - 0.05;

    return {
        'id': `some random id ${i} :P`,
        'deg_coords': {
            'lat': lat,
            'lng': lng
        },
        'zone': {
            'id': '04203',
            'deg_coords': {
                'lat': -31.915700000000008,
                'lng': -71.5107
            },
            'natural_key': 'cl.coquimbo.choapa.los-vilos',
            'zone_hierarchy': [
                {
                    'id': '00',
                    'deg_coords': {
                        'lat': -33.44169999999999,
                        'lng': -70.6541
                    },
                    'natural_key': 'cl',
                    'natural_name': 'cl',
                    'name': 'Chile',
                    'canonical_name': 'cl',
                    'target_count': 740,
                    'coords': {
                        'x': 346246.9352630554,
                        'y': 6298521.130179277,
                        'srid': 32719
                    },
                    'parent': null,
                    'type': 'pais'
                },
                {
                    'id': '04',
                    'deg_coords': {
                        'lat': -30.830100000000005,
                        'lng': -70.9816
                    },
                    'natural_key': 'cl.coquimbo',
                    'natural_name': 'cl.coquimbo',
                    'name': 'Coquimbo',
                    'canonical_name': 'coquimbo',
                    'target_count': 386,
                    'coords': {
                        'x': 310471.8145419487,
                        'y': 6587546.909209114,
                        'srid': 32719
                    },
                    'parent': '00',
                    'type': 'region'
                },
                {
                    'id': '042',
                    'deg_coords': {
                        'lat': -31.8006,
                        'lng': -70.98270000000001
                    },
                    'natural_key': 'cl.coquimbo.choapa',
                    'natural_name': 'cl.coquimbo.choapa',
                    'name': 'Choapa',
                    'canonical_name': 'choapa',
                    'target_count': 90,
                    'coords': {
                        'x': 312302.44154084736,
                        'y': 6479954.150602724,
                        'srid': 32719
                    },
                    'parent': '04',
                    'type': 'provincia'
                }
            ],
            'natural_name': 'cl.coquimbo.choapa.los-vilos',
            'name': 'Los Vilos',
            'canonical_name': 'los-vilos',
            'target_count': 6,
            'coords': {
                'x': 262600.48528377386,
                'y': 6466157.337861293,
                'srid': 32719
            },
            'parent': '042',
            'type': 'comuna'
        },
        'work_sites': [
            {
                'id': `another random id ${i}`,
                'name': `FAENA DE PRUEBA ${i}`,
                'entity': {
                    'id': `minera-de-prueba-${i}`,
                    'name': `MINERA DE PRUEBA ${i}`,
                    'meta': {}
                }
            }
        ],
        'remote': i % 3 === 0 ? remotes[Math.floor(i / 3) % 3] : null,
        'name': `Depósito de Prueba ${i}`,
        'canonical_name': `de-prueba-${i}`,
        'can_emit_alerts': false,
        'meta': {},
        'coords': {
            'x': 307990.0875,
            'y': 6462098.6248,
            'srid': 32719
        },
        'geometry': 'SRID=4326;POINT (-71.03176046189184 -31.96087334655541)',
        'perimeter': null,
        'type': 'tranque-de-relave',
        'state': states[i % 3]
    };
}


export function generateTargetData(targetCount, timeseriesCount, ticketsCount, profile) {
    const targets = [];
    const timeseries = [];
    const tickets = []
    for (let i = 0; i < targetCount; i++) {
        const target = generateTarget(i);
        targets.push(target);
        for (let j = 0; j < timeseriesCount; j++) {
            // target 0-targetCount/4 do not have an event
            // odd targets have event value 0
            // even targets have event and every third timeseries have event value 1
            // threshold is always 0
            // i % 3 === 0 means target has remote
            const value = i < targetCount / 4 ? null : i % 2 === 0 && j % 3 === 0 ? 1 : 0;
            timeseries.push(generateTimeseries(i, j, target.canonical_name, value));

        }
        for (let j = 0; j < ticketsCount; j++) {
            tickets.push(generateTickets(i,j,target.canonical_name, profile));
        }
    }
    return {targets, timeseries, tickets};
}

export function getTargetByAttrs(attrs) {
    return {
        can_emit_alerts: attrs.can_emit_alerts || true,
        canonical_name: attrs.canonical_name || 'deposito',
        coords: attrs.coords || {x: 307990.0875, y: 6462098.6248, srid: 32719},
        deg_coords: attrs.deg_coords || {lat: -31.96087334655541, lng: -71.03176046189184},
        geometry: attrs.geometry || "SRID=4326;POINT (-71.03176046189184 -31.96087334655541)",
        id: attrs.id || 'deposito-id',
        meta: attrs.meta || {},
        name: attrs.name || '[Nombre de depósito]',
        perimeter: attrs.perimeter,
        remote: attrs.remote,
        state: attrs.state || 'activo',
        state_description: attrs.state_description || 'Activo',
        type: attrs.type,
        type_description: attrs.type_description,
        work_sites: attrs.work_sites || [
            {
                'id': `arbitrary id`,
                'name': `FAENA DE PRUEBA`,
                'entity': {
                    'id': `minera-de-prueba`,
                    'name': `MINERA DE PRUEBA`,
                    'meta': {}
                }
            }
        ],
        zone: attrs.zone || {
            'id': '04203',
            'deg_coords': {
                'lat': -31.915700000000008,
                'lng': -71.5107
            },
            'natural_key': 'cl.coquimbo.choapa.los-vilos',
            'zone_hierarchy': [
                {
                    'id': '00',
                    'deg_coords': {
                        'lat': -33.44169999999999,
                        'lng': -70.6541
                    },
                    'natural_key': 'cl',
                    'natural_name': 'cl',
                    'name': 'Chile',
                    'canonical_name': 'cl',
                    'target_count': 740,
                    'coords': {
                        'x': 346246.9352630554,
                        'y': 6298521.130179277,
                        'srid': 32719
                    },
                    'parent': null,
                    'type': 'pais'
                },
                {
                    'id': '04',
                    'deg_coords': {
                        'lat': -30.830100000000005,
                        'lng': -70.9816
                    },
                    'natural_key': 'cl.coquimbo',
                    'natural_name': 'cl.coquimbo',
                    'name': 'Coquimbo',
                    'canonical_name': 'coquimbo',
                    'target_count': 386,
                    'coords': {
                        'x': 310471.8145419487,
                        'y': 6587546.909209114,
                        'srid': 32719
                    },
                    'parent': '00',
                    'type': 'region'
                },
                {
                    'id': '042',
                    'deg_coords': {
                        'lat': -31.8006,
                        'lng': -70.98270000000001
                    },
                    'natural_key': 'cl.coquimbo.choapa',
                    'natural_name': 'cl.coquimbo.choapa',
                    'name': 'Choapa',
                    'canonical_name': 'choapa',
                    'target_count': 90,
                    'coords': {
                        'x': 312302.44154084736,
                        'y': 6479954.150602724,
                        'srid': 32719
                    },
                    'parent': '04',
                    'type': 'provincia'
                }
            ],
            'natural_name': 'cl.coquimbo.choapa.los-vilos',
            'name': 'Los Vilos',
            'canonical_name': 'los-vilos',
            'target_count': 6,
            'coords': {
                'x': 262600.48528377386,
                'y': 6466157.337861293,
                'srid': 32719
            },
            'parent': '042',
            'type': 'comuna'
        }
    }
}

export const TARGETS_CENTER = [baseLat, baseLng];
