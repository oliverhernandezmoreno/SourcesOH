import FrequencyCard from '@miners/containers/EF/FrequencyCard';

export const regularFrequencyTable = {
    header: [
        {label: 'Ingreso de datos vía excel', cellFn: (template) => ({value: template.label})},
        {label: 'Próximo ingreso', cellFn: FrequencyCard.worstFrequency}
    ],
    dataTemplate: [
        {label: 'Altura de coronamiento', queryTemplate:'ef-mvp.m2.parameters.altura-muro'},
        {label:' Cota lamas', queryTemplate:'ef-mvp.m2.parameters.variables.cota-lamas'},
        {label:' Cota espejo de agua', queryTemplate:'ef-mvp.m2.parameters.variables.cota-laguna'},
        {label:' Densidad y porcentaje de finos', queryTemplate:'ef-mvp.m2.parameters.porcentaje-finos'},
        {label: 'Laguna distancia-muro', queryTemplate:'ef-mvp.m2.parameters.distancia-laguna'},
        {label:' Granulometría', queryTemplate:'ef-mvp.m2.parameters.granulometria'},
        {label: 'Perfiles Topográficos', queryTemplate: 'ef-mvp.m2.parameters.variables.elevacion'},
        {label: 'Piezometría manual', queryTemplate:'ef-mvp.m2.parameters.presion-poros-manual'},
        {label: 'Tonelaje de relaves acumulados', queryTemplate:'ef-mvp.m2.parameters.volumen-relave'},
        // // {label: 'Monolitos', queryTemplate:''},
        // // {label: 'Inclinómetro manual', queryTemplate:''},
        {label: 'Nivel freático cubeta', queryTemplate:'ef-mvp.m2.parameters.nivel-freatico-manual'},
        // // {label: 'Pendiente de playa', queryTemplate: ''},
    ]
};

const triggers =[
    "ef-mvp.m1.triggers.prisma",
    "ef-mvp.m1.triggers.distribucion-inadecuada",
    "ef-mvp.m1.triggers.deslizamiento-menor",
    "ef-mvp.m1.triggers.estribo",
    "ef-mvp.m1.triggers.vertedero",
    "ef-mvp.m1.triggers.cota-vertedero",
    "ef-mvp.m1.triggers.aguas-claras",
    "ef-mvp.m1.triggers.canales-perimetrales",
    "ef-mvp.m1.triggers.asentamientos-diferenciales",
    "ef-mvp.m1.triggers.drenaje",
    "ef-mvp.m1.triggers.turbiedad",
    "ef-mvp.m1.triggers.filtraciones",
    "ef-mvp.m1.triggers.subsidencia-muro",
    "ef-mvp.m1.triggers.subsidencia-cubeta",
    "ef-mvp.m1.triggers.grietas",
    "ef-mvp.m1.triggers.deslizamiento-inminente",
    "ef-mvp.m1.triggers.important.lluvia",
    "ef-mvp.m1.triggers.important.terremoto-4-6",
    "ef-mvp.m1.triggers.critical.deslizamiento-critico",
    "ef-mvp.m1.triggers.critical.deslizamiento-mayor",
    "ef-mvp.m1.triggers.critical.rebalse",
    "ef-mvp.m1.triggers.critical.terremoto-7",
    "ef-mvp.m1.triggers.forecasts.lluvia",
    "ef-mvp.m1.triggers.forecasts.nevazon",
    "ef-mvp.m1.triggers.forecasts.vientos",
    "ef-mvp.m1.design.altura",
    "ef-mvp.m1.design.revancha",
    "ef-mvp.m1.design.coronamiento",
    "ef-mvp.m1.design.superficie",
    "ef-mvp.m1.design.laguna",
    "ef-mvp.m1.design.talud",
    "ef-mvp.m1.design.materiales",
    "ef-mvp.m1.design.geomembrana"
]

const vulnerability =[
    "ef-mvp.m1.vulnerability.estado",
    "ef-mvp.m1.vulnerability.tipo",
    "ef-mvp.m1.vulnerability.metodo",
    "ef-mvp.m1.vulnerability.gobernanza",
    "ef-mvp.m1.vulnerability.instrumentacion",
    "ef-mvp.m1.vulnerability.exposicion-crecidas",
    "ef-mvp.m1.vulnerability.exposicion-escorrentias",
    "ef-mvp.m1.vulnerability.exposicion-avalanchas",
    "ef-mvp.m1.vulnerability.actualizado",
    "ef-mvp.m1.vulnerability.vulnerabilidad",
]

export const inspectionsTable = {
    header: [
        {label: 'Tipo de inspección', cellFn: (template) => ({value: template.label})},
        {label: 'Próximo ingreso', cellFn: FrequencyCard.worstFrequency}
    ],
    dataTemplate: [
        {label: 'Inspección diaria ', queryTemplate: triggers},
        {label: 'Inspección mensual', queryTemplate: vulnerability},
    ]
};
