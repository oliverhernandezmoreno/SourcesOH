import { FILTER_TYPES } from './EFFilters/EFFilter';
import { DASHES } from '@app/components/charts/VegaLegendMiniPlot.js';
import * as EFViews from './EFViews/';

const defaultPlotConfigs = {
    singleSource: {
        getRowGroupLabel: (row) => row?.data_source?.group_names?.[1] ?? '',
        getRowLabels: (row) => [row?.data_source?.name ?? ''],
        getColumnLabels: (metadata) => {
            const colsPerRow = metadata?.flatMap(row => row.thresholds?.flatMap((threshold, index) => {
                return [
                    threshold.lower ? `Umbral Inferior ${index + 1}` : undefined,
                    threshold.upper ? `Umbral Superior ${index + 1}` : undefined,
                ]
            }));
            const cols = [...new Set(colsPerRow.filter(c => c !== undefined))];
            return ['', ...cols];
        },
        getHorizontalLinesData: (metadata, timeSeriesData) => {
            const colsPerRow = metadata?.flatMap((row, rowIndex) => {
                let currentColIndex = 1;
                return row.thresholds.flatMap((threshold, colIndex) => {
                    return [
                        threshold.lower ? { value: threshold.lower, name: row.canonical_name, colIndex: currentColIndex++ } : undefined,
                        threshold.upper ? { value: threshold.upper, name: row.canonical_name, colIndex: currentColIndex++ } : undefined,
                    ];
                });
            });
            const cols = [...new Set(colsPerRow.filter(c => c !== undefined))];
            const data = cols.map((threshold, index) => {
                return { value: threshold.value, name: `${threshold.name}-${threshold.colIndex}` }
            });
            return data;
        },
        getCellTimeSeriesName: (column_name, colIndex, row) => {
            return colIndex === 0 ? row.canonical_name : `${row.canonical_name}-${colIndex}`;
        },
        makeMetadata: (metaDataDict) => {
            if (!metaDataDict) return;
            return Object.keys(metaDataDict).map((canonical_name) => {
                return {
                    canonical_name,
                    ...metaDataDict[canonical_name]
                }
            })
        },
        isTemporal: true,
        filterType: FILTER_TYPES.DATE_RANGE
    },
    multipleSources: {
        getRowGroupLabel: (row) => row?.[0]?.data_source?.group_names?.[1] ?? '',
        getRowLabels: (row) => row.map(col => col.data_source.name),
        getColumnLabels: (metadata) => {
            if (!metadata || metadata.length === 0) return [];
            return metadata.length > 0 ? metadata[0].map(col => col.name) : []
            // return [];
        },
        /** column_name must match a key in timeseriesData */
        getCellTimeSeriesName: (column_name, col_index, row) => {
            // return col_index === 0 ? row[col_index].canonical_name : `${column_name}-${row[col_index]?.data_source?.canonical_name}`;
            return row[col_index]?.canonical_name;
        },
        makeMetadata: (metaDataDict) => {
            if (!metaDataDict) return;
            return Object.keys(metaDataDict).map((canonical_name) => {
                return {
                    canonical_name,
                    ...metaDataDict[canonical_name]
                }
            }).reduce((prevList, currentDict) => {
                // .name = Cota de lamas , Altura
                // find index of first row missing this column
                const rowIndex = prevList.findIndex(row => !row.some(col => col.name === currentDict.name) || row.length === 0)
                // rowIndex == 0 <=> first row is missing this column
                if (rowIndex === 0) {
                    // if no rows, add new row with col
                    // if row, append to row
                    // initial condition [[]] ensures .push works
                    prevList[rowIndex].push(currentDict)
                    return prevList;
                }
                if (rowIndex === -1) {
                    const colIndex = prevList[0].findIndex(col => col?.name === currentDict.name);
                    const newRow = new Array(prevList[0].length).fill(undefined);
                    newRow[colIndex] = currentDict;
                    prevList.push(newRow);
                    return prevList;
                }
                if (rowIndex > 0) {
                    const colIndex = prevList[0].findIndex(col => col?.name === currentDict.name);
                    prevList[rowIndex][colIndex] = currentDict;
                    return prevList;
                }
                return prevList;
            }, [[]])
        },
        isTemporal: true,
        filterType: FILTER_TYPES.DATE_RANGE
    },
}

export const TEMPLATE_TO_PLOTS = {
    'revancha-operacional': {
        sections: [
            {
                title: 'Revancha operacional',
                sources: ['revancha-operacional'],
                config: defaultPlotConfigs.singleSource
            },
            {
                title: 'Cota de lamas',
                sources: ['variables.cota-lamas', 'altura-muro'],
                config: defaultPlotConfigs.multipleSources
            }
        ]
    },
    'revancha-hidraulica': {
        sections: [
            {
                title: 'Revancha hidráulica',
                sources: ['revancha-hidraulica'],
                config: {
                    ...defaultPlotConfigs.singleSource, getColumnLabels: (metadata) => {
                        const labels = defaultPlotConfigs.singleSource.getColumnLabels(metadata);
                        labels[0] = 'Medición'
                        return labels;
                    }
                }
            },
            {
                title: 'Cota de espejo de aguas y altura mínima de muro',
                sources: ['variables.cota_laguna', 'altura-muro'],
                config: defaultPlotConfigs.multipleSources
            }
        ]
    },
    'distancia-minima': {
        sections: [
            {
                title: 'Distancia mínima laguna-muro',
                sources: ['distancia-laguna'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'pendiente-talud': {
        sections: [
            {
                title: 'Pendiente de talud aguas abajo',
                sources: ['pendiente-muro.global-aguas-abajo'],
                config: defaultPlotConfigs.singleSource
            },
            {
                title: 'Pendiente de talud aguas arriba',
                sources: ['pendiente-muro.global-aguas-arriba'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'pendiente-playa': {
        sections: [
            {
                title: 'Pendiente de playa',
                sources: ['pendiente-playa'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'altura-muro': {
        sections: [
            {
                title: 'Altura de coronamiento',
                sources: ['altura-muro'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'ancho-coronamiento': {
        sections: [
            {
                title: 'Ancho de coronamiento',
                sources: ['ancho-coronamiento'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'perfiles-topograficos': {
        Component: EFViews.TopographicProfiles,
        sections: [
            {
                title: 'Perfiles topográficos',
                sources: ['variables.elevacion', 'variables.perfil-suelo-fundacion'],
                config: {
                    ...defaultPlotConfigs.multipleSources,
                    getColumnLabels: (metadata) => {
                        if (!metadata || metadata.length === 0) return [];
                        return metadata[0].flatMap(dataSource => {
                            return [`${dataSource.name} (fecha 1)`, `${dataSource.name} (fecha 2)`];
                        })
                    },
                    /** column_name must match a key in timeseriesData */
                    getCellTimeSeriesName: (column_name, col_index, row) => {
                        return `${row[parseInt(col_index / 2)]?.canonical_name}-date-${col_index % 2}`;
                    },
                    getRowLabels: (row) => row.flatMap(col => [col.data_source.canonical_name, col.data_source.canonical_name]),
                    isTemporal: false,
                    filterType: FILTER_TYPES.MONTHLY_COMPARISON,
                    xAxisTitle: 'DISTANCIA HORIZONTAL',
                    xAxisUnits: 'm',
                    linesStylesModifier: (linesStyles) => {

                        return linesStyles.map((row, rowIndex) => {
                            return row.map((style, colIndex) => ({
                                ...style,
                                dash: colIndex % 2 === 0 ? DASHES[0] : DASHES[1]
                            }))
                        })
                    }
                },
            }
        ]
    },
    'cotas-piezometricas-en-el-tiempo': {
        Component: EFViews.PiezometricHead,
        sections: [
            {
                title: 'Cotas piezométricas en el tiempo',
                sources: ['presion-poros'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'perfil-topografico-y-cotas-piezometricas': {
        Component: EFViews.TopographicProfilesAndHead,
        sections: [
            {
                title: 'Perfil topográfico y cotas piezométricas',
                sources: ['presion-poros'],
                config: {
                    ...defaultPlotConfigs.singleSource,
                    isTemporal: false,
                    xAxisTitle: 'DISTANCIA HORIZONTAL',
                }
            }
        ]
    },
    'nivel-freatico-de-cubeta': {
        sections: [
            {
                title: 'Nivel freático de cubeta',
                sources: ['nivel-freatico-cubeta-deposito'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'detalle-de-piezometro': {
        Component: EFViews.PiezometerDetail,
        sections: [
            {
                title: 'Detalle de piezómetro',
                sources: ['presion-poros'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'porcentaje-de-finos': {
        Component: EFViews.FinesPercentage
    },
    'densidad-del-muro': {
        Component: EFViews.WallDensity
    },
    'curva-granulometrica': {
        Component: EFViews.GranulometricCurve
    },
    'caudal': {
        Component: EFViews.Caudal,
        sections: [
            {
                title: 'Caudal',
                sources: ['caudal'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'turbiedad': {
        Component: EFViews.Turbidity,
        sections: [
            {
                title: 'Turbiedad',
                sources: ['turbiedad'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'detalle-de-caudalimetro': {
        Component: EFViews.FlowmeterDetail,
        sections: [
            {
                title: 'Caudal',
                sources: ['caudal'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'detalle-de-turbidimetro': {
        Component: EFViews.TurbidimeterDetail,
        sections: [
            {
                title: 'Turbiedad',
                sources: ['turbiedad'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'intensidad-de-lluvia': {
        Component: EFViews.RainIntensity,
    },
    'tonelaje': {
        Component: EFViews.Tonelaje,
        sections: []
    },
    'potencial-de-rebalse': {
        Component: EFViews.OverflowPotential,
        sections: [
            {
                title: 'Potencial de rebalse',
                sources: ['potencial-rebalse', 'potencial-rebalse'],
                config: defaultPlotConfigs.singleSource
            }
        ]
    },
    'grietas-en-el-muro': {
        Component: EFViews.ExternalIntegrity,
        /** A section here is a row with a switch */
        sections: [
            {
                templateName: "ef-mvp.m1.triggers.grietas",
                label: "Existe presencia de grietas en el muro",
            },
            {
                templateName: "ef-mvp.m2.parameters.discrete.inputs.grietas",
                label: "Las grietas detectadas poinen en riesgo la integridad del muro",
            },
            {
                // templateName: "ef-mvp.m2.parameters.integridad-externa.grietas.C2",
                label: "Ante un sismo reciente, las grietas detectadas ponen en riesgo la integridad del muro",
            },
            {
                // templateName: "ef-mvp.m2.parameters.integridad-externa.grietas.C3",
                label: "Se detectan grietas longitudinales posteriores a un deslizamiento superficial. Esto indicaría evidencia de un deslizamiento mayor que pone en riesgo la integridad del muro",
            },
        ]
    },
    'humedad-o-filtraciones-en-talud': {
        Component: EFViews.ExternalIntegrity,
        /** A section here is a row with a switch */
        sections: [
            {
                templateName: "ef-mvp.m1.triggers.filtraciones",
                label: "Existe presencia de filtraciones o humedad",
            },
            {
                templateName: "ef-mvp.m2.parameters.discrete.inputs.filtraciones",
                label: "Las filtraciones o humedad ponen en riesgo la integridad del muro",
            },
            {
                // templateName: "ef-mvp.m2.parameters.integridad-externa.filtraciones.C2",
                label: "Ante un sismo reciente, las filtraciones o humedad ponen en riesgo la integridad del muro",
            }
        ]
    },
    'subsidencia-o-socavacion-cerca-del-muro': {
        Component: EFViews.ExternalIntegrity,
        /** A section here is a row with a switch */
        sections: [
            {
                templateName: "ef-mvp.m1.triggers.subsidencia-muro",
                label: "Existe subsidencia o socavación cerca del muro",
            },
            {
                templateName: "ef-mvp.m1.triggers.subsidencia-cubeta",
                label: "Existe subsidencia o socavón en la cubeta",
            },
            {
                // templateName: "el-mauro.g-sector-a.ef-mvp.m2.parameters.integridad-externa.subsidencia.muro.C1",
                label: "Subsidencia y/o socavón ponen en riesgo la integridad del muro",
            },
            {
                // templateName: "el-mauro.g-sector-a.ef-mvp.m2.parameters.integridad-externa.subsidencia.muro.C1",
                label: "Ante un sismo reciente, los fenómenos de subsidencia y/o socavón ponen en riesgo la integridad del muro",
            }
        ]
    },
    'integridad-de-los-estribos': {
        Component: EFViews.ExternalIntegrity,
        /** A section here is a row with a switch */
        sections: [
            {
                templateName: "ef-mvp.m1.triggers.estribo",
                label: "Existe un problema con la integridad de los estribos",
            },
            {
                templateName: "ef-mvp.m2.parameters.integridad-externa.estribos.tendencia-activacion-manual",
                label: "Existe tendencia desfavorable asociada a deformación",
            },
            {
                templateName: "ef-mvp.m2.parameters.discrete.inputs.estribos",
                label: "Existen problemas que afectan la estabilidad del estribo",
            },
            {
                templateName: "ef-mvp.m2.parameters.integridad-externa.estribos.desplazamiento-activacion-manual",
                label: "Existe un desplazamiento relativo entre el muro y el suelo de fundación",
            },
        ]
    },
    'vertedero': {
        Component: EFViews.Landfill,
        sections: []
    },
    'deformacion-y-resistencia': {
        Component: EFViews.DocumentsView,
        /** A section here is a row with a switch, except first one, which is the documents section */
        sections: [
            {
                templateName: "documents-template-name",
                label: "deformacion-y-resistencia",
            },
            {
                templateName: "ef-mvp.m2.parameters.modulos-deformacion-resistencia-muro.detecta-B1",
                label: "Existe incumplimiento de propiedades resistentes o el módulo de deformación",
            },
            {
                templateName: "ef-mvp.m2.parameters.modulos-deformacion-resistencia-muro.detecta-B2",
                label: "Existe incumplimiento de criterios de densidad determinado por ensayo SPT o similar",
            },
            {
                templateName: "ef-mvp.m2.parameters.modulos-deformacion-resistencia-muro.detecta-C2",
                label: "Ensayo SPT o similar indica peligro para la estabilidad del depósito debido a dimensiones del área afectada",
            },
            {
                templateName: "ef-mvp.m2.parameters.modulos-deformacion-resistencia-muro.detecta-D1",
                label: "Ensayo SPT o similar indica que uno o más sectores se encuentran bajo el nivel freático o con un nivel alto de saturación",
            },
        ]
    },
    'resistencia-de-relaves': {
        Component: EFViews.DocumentsView,
        /** A section here is a row with a switch, except first one, which is the documents section */
        sections: [
            {
                templateName: "documents-template-name",
                label: "resistencia-de-relaves",
            },
            {
                templateName: "ef-mvp.m2.parameters.resistencia-material-relaves.propiedades-resistentes",
                label: "Existe incumplimiento de las propiedades resistentes en la cubeta",
            },
        ]
    },
    'diseño-de-drenaje': {
        Component: EFViews.DocumentsView,
        /** A section here is a row with a switch, except first one, which is the documents section */
        sections: [
            {
                templateName: "documents-template-name",
                label: "diseño-de-drenaje",
            },
            {
                templateName: "ef-mvp.m2.parameters.cumplimiento-diseno-dren.validado",
                label: "No se ha validado la documentación",
            },
            {
                templateName: "ef-mvp.m2.parameters.cumplimiento-diseno-dren.informacion-parcial",
                label: "La información es parcial",
            },
            {
                templateName: "ef-mvp.m2.parameters.cumplimiento-diseno-dren.sin-informacion",
                label: "Sin información",
            },
        ]
    },
    'caracterizacion-geotecnica': {
        Component: EFViews.DocumentsView,
        /** A section here is a row with a switch, except first one, which is the documents section */
        sections: [
            {
                templateName: "documents-template-name",
                label: "caracterizacion-geotecnica",
            },
            {
                templateName: "ef-mvp.m2.parameters.evaluacion-adecuada-caracterizacion-geotc.validado",
                label: "No se ha validado la documentación",
            },
            {
                templateName: "ef-mvp.m2.parameters.evaluacion-adecuada-caracterizacion-geotc.informacion-parcial",
                label: "La información es parcial",
            },
            {
                templateName: "ef-mvp.m2.parameters.evaluacion-adecuada-caracterizacion-geotc.sin-informacion",
                label: "Sin información",
            },
        ]
    },
    'estudio-de-revancha': {
        Component: EFViews.DocumentsView,
        /** A section here is a row with a switch, except first one, which is the documents section */
        sections: [
            {
                templateName: "documents-template-name",
                label: "estudio-de-revancha",
            },
            {
                templateName: "ef-mvp.m2.parameters.revancha-minima.documento-requiere-actualizacion",
                label: "Los estudios de revancha están desactualizados",
            },
            {
                templateName: "ef-mvp.m2.parameters.revancha-minima.documento-no-existe",
                label: "Sin información",
            },
        ]
    },
}


