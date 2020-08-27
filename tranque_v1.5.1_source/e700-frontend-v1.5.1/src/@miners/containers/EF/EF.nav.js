import SubMenu from '@miners/containers/layout/SubMenu';
import { reverse } from '@app/urls';

function etl(target) {
    return [
        {
            title: 'Ingresar datos',
            children: [
                {
                    subtitle: 'Topografía'
                },
                {
                    title: 'Perfiles topográficos',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_topographic' })
                },
                {
                    title: 'Distancia muro laguna',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:muro_laguna' })
                },
                {
                    title: 'Cota espejo de agua',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:cota_laguna' })
                },
                {
                    title: 'Cota lamas',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:cota_lamas' })
                },
                {
                    title: 'Cota coronamiento muro',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:cota_coronamiento_muro' })
                },
                {
                    subtitle: 'Granulometría y densidad'
                },
                {
                    title: 'Densidad y porcentaje de finos',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:densidad' })
                },
                {
                    title: 'Curvas granulométricas',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_granulometry' })
                },
                {
                    subtitle: 'Otros datos'
                },
                {
                    title: 'Tonelaje relaves acumulados',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:volumen_relave' })
                },
                {
                    title: 'Nivel freático de la cubeta del depósito',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:nivel_freatico' })
                },
                {
                    title: 'Piezometría manual',
                    path: reverse('miners.target.ef.dataLoad.fromFile', { target, executor: 'ef_parameter:piezometria' })
                },
            ],
        },
        {
            title: 'Registro de ingresos',
            children: [
                {
                    subtitle: 'Topografía'
                },
                {
                    title: 'Perfiles topográficos',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_topographic' })
                },
                {
                    title: 'Distancia muro laguna',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:muro_laguna' })
                },
                {
                    title: 'Cota espejo de agua',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:cota_laguna' })
                },
                {
                    title: 'Cota lamas',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:cota_lamas' })
                },
                {
                    title: 'Cota coronamiento muro',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:cota_coronamiento_muro' })
                },
                {
                    subtitle: 'Granulometría y densidad'
                },
                {
                    title: 'Densidad y porcentaje de finos',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:densidad' })
                },
                {
                    title: 'Curvas granulométricas',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_granulometry' })
                },
                {

                    subtitle: 'Otros datos'
                },
                {
                    title: 'Tonelaje relaves acumulados',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:volumen_relave' })
                },
                {
                    title: 'Nivel freático de la cubeta del depósito',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:nivel_freatico' })
                },
                {
                    title: 'Piezometría manual',
                    path: reverse('miners.target.ef.registry.operationList', { target, executor: 'ef_parameter:piezometria' })
                },
            ],
        }
    ];
}

function getTimeseriesNavPath(target, template) {
    return reverse('miners.target.ef.data.template', { target, template });
}

function timeSeriesNav(target) {
    return [
        {
            title: 'Topografía',
            children: [
                {
                    title: 'Revancha Operacional',
                    path: getTimeseriesNavPath(target, 'revancha-operacional')
                },
                {
                    title: 'Revancha hidráulica',
                    path: getTimeseriesNavPath(target, 'revancha-hidraulica')
                },
                {
                    title: 'Distancia mínima laguna-muro',
                    path: getTimeseriesNavPath(target, 'distancia-minima')
                },
                {
                    title: 'Pendiente de talud',
                    path: getTimeseriesNavPath(target, 'pendiente-talud')
                },
                {
                    title: 'Pendiente de playa',
                    path: getTimeseriesNavPath(target, 'pendiente-playa')
                },
                {
                    title: 'Altura de coronamiento',
                    path: getTimeseriesNavPath(target, 'altura-muro')
                },
                {
                    title: 'Ancho de coronamiento',
                    path: getTimeseriesNavPath(target, 'ancho-coronamiento')
                },
                {
                    title: 'Perfiles topográficos',
                    path: getTimeseriesNavPath(target, 'perfiles-topograficos')
                },
            ]
        },
        {
            title: 'Piezometría',
            children: [
                {
                    title: 'Cotas piezométricas en el tiempo',
                    path: getTimeseriesNavPath(target, 'cotas-piezometricas-en-el-tiempo')
                },
                {
                    title: 'Perfil topográfico y cotas piezométricas',
                    path: getTimeseriesNavPath(target, 'perfil-topografico-y-cotas-piezometricas')
                },
                {
                    title: 'Nivel freático de cubeta',
                    path: getTimeseriesNavPath(target, 'nivel-freatico-de-cubeta')
                },
                {
                    title: 'Detalle de piezómetro',
                    path: getTimeseriesNavPath(target, 'detalle-de-piezometro')
                }
            ]
        },
        {
            title: "Granulometría y densidad",
            children: [
                {
                    title: 'Porcentaje de finos',
                    path: getTimeseriesNavPath(target, 'porcentaje-de-finos')
                },
                {
                    title: 'Curva granulométrica',
                    path: getTimeseriesNavPath(target, 'curva-granulometrica')
                },
                {
                    title: 'Densidad del muro',
                    path: getTimeseriesNavPath(target, 'densidad-del-muro')
                },
            ]
        },
        {
            title: 'Sistemas de drenaje',
            children: [
                {
                    title: 'Caudal',
                    path: getTimeseriesNavPath(target, 'caudal')
                },
                {
                    title: 'Turbiedad',
                    path: getTimeseriesNavPath(target, 'turbiedad')
                },
                {
                    title: 'Detalle de caudalímetro',
                    path: getTimeseriesNavPath(target, 'detalle-de-caudalimetro')
                },
                {
                    title: 'Detalle de turbidímetro',
                    path: getTimeseriesNavPath(target, 'detalle-de-turbidimetro')
                }
            ]
        },
        {
            title: 'Intensidad de lluvia',
            path: getTimeseriesNavPath(target, 'intensidad-de-lluvia')
        },
        {
            title: 'Tonelaje',
            path: getTimeseriesNavPath(target, 'tonelaje')
        },
        {
            title: 'Potencial de rebalse',
            path: getTimeseriesNavPath(target, 'potencial-de-rebalse')
        },
        {
            title: "Integridad externa",
            children: [
                {
                    title: 'Grietas en el muro',
                    path: getTimeseriesNavPath(target, 'grietas-en-el-muro')
                },
                {
                    title: 'Humedad o filtraciones en talud',
                    path: getTimeseriesNavPath(target, 'humedad-o-filtraciones-en-talud')
                },
                {
                    title: 'Subsidencia o socavación cerca del muro',
                    path: getTimeseriesNavPath(target, 'subsidencia-o-socavacion-cerca-del-muro')
                },
                {
                    title: 'Integridad de los estribos',
                    path: getTimeseriesNavPath(target, 'integridad-de-los-estribos')
                }
            ]
        },
        {
            title: 'Vertedero de emergencia',
            path: getTimeseriesNavPath(target, 'vertedero')
        },
        {
            title: "Documentos",
            children: [
                {
                    title: "Módulos de deformación y resistencia",
                    path: getTimeseriesNavPath(target, 'deformacion-y-resistencia')
                },
                {
                    title: "Resistencia del material de relaves",
                    path: getTimeseriesNavPath(target, 'resistencia-de-relaves')
                },
                {
                    title: "Diseño del sistema de drenaje",
                    path: getTimeseriesNavPath(target, 'diseño-de-drenaje')
                },
                {
                    title: "Caracterización geotécnica del suelo",
                    path: getTimeseriesNavPath(target, 'caracterizacion-geotecnica')
                },
                {
                    title: "Estudio de revancha mínima",
                    path: getTimeseriesNavPath(target, 'estudio-de-revancha')
                }
            ]
        },
        // {
        //     title: 'Presión de poros',
        //     path: getTimeseriesNavPath(target, 'presion-poros')
        // },
        // {
        //     title: 'Relaves acumulados',
        //     path: getTimeseriesNavPath(target, 'volumen-relave')
        // }
    ];
}

function dataNav(target) {
    return [
        ...etl(target),
        SubMenu.Separator,
        {
            subtitle: 'Parámetros de estabilidad física'
        },
        ...timeSeriesNav(target)
    ];
}

export function getEFDrawerItems(target) {
    return [
        {
            title: 'Dashboard',
            path: reverse('miners.target.ef.dashboard', { target }),
            icon: 'RemoveRedEye'
        },
        {
            title: 'Datos',
            path: reverse('miners.target.ef.data', { target }),
            icon: 'Assessment'
        },
        {
            title: 'Inspecciones y evaluaciones',
            path: reverse('miners.target.ef.inspection-and-evaluation', { target }),
            icon: 'Inspection'
        },
        {
            title: 'Alertas y eventos',
            path: reverse('miners.target.ef.tickets.open', { target }),
            icon: 'Flag',
        },
    ];
}

export function getEFSubMenuItems(target) {
    return dataNav(target);
}
