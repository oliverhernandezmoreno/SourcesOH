export const RISK_NORMS = [
    'vida-acuatica',
    'recreacion',
    'agua-potable',
    'riego'
];

const labels = {
    'vida-acuatica': 'Protección vida acuática',
    'recreacion': 'Recreacional',
    'agua-potable': 'Consumo humano/bebida animal',
    'riego': 'Riego',
    'subterraneo': 'aguas subterráneas',
    'superficial': 'aguas superficiales'
};

export function getEMACLabel(id) {
    return labels[id] || 'desconocido';
}

export function getEMACThresholdLabel(kind) {
    return `Uso ${getEMACLabel(kind)}`;
}

const SUBTERRANEO = 'subterraneo';
const SUPERFICIAL =  'superficial';
const AGUAS_ARRIBA = 'aguas-arriba';
const AGUAS_ABAJO = 'aguas-abajo';
const groups = [
    SUBTERRANEO,
    SUPERFICIAL,
    AGUAS_ARRIBA,
    AGUAS_ABAJO,
];

export function getEMACtypes(source) {
    let names = {};
    if (source.groups.includes(AGUAS_ARRIBA)) {
        names['water'] = 'Aguas arriba';
    }
    if (source.groups.includes(AGUAS_ABAJO)) {
        names['water'] = 'Aguas abajo';
    }
    if (source.groups.includes(SUPERFICIAL)) {
        names['surface'] = 'Superficial';
    }
    if (source.groups.includes(SUBTERRANEO)) {
        names['surface'] = 'Subterráneo';
    }
    return names;
}

export function getEMACGroups(source) {
    return source.groups
        .map((g, index) => ({g, index}))
        .filter(({g}) => groups.indexOf(g) !== -1)
        .map(({index}) => source.group_names[index]);
}
