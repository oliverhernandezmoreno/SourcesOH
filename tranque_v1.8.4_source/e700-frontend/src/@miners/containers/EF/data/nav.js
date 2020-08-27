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

const WIKI_EF_VIEWS = "glossary.ef-views";
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
        ],
        wikiLink: WIKI_EF_VIEWS+".revancha-operacional"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".revancha-hidraulica"
    },
    'distancia-minima': {
        sections: [
            {
                title: 'Distancia mínima laguna-muro',
                sources: ['distancia-laguna'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".distancia-minima-laguna-muro"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".pendiente-de-talud"
    },
    'pendiente-playa': {
        sections: [
            {
                title: 'Pendiente de playa',
                sources: ['pendiente-playa'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".pendiente-de-playa"
    },
    'altura-muro': {
        sections: [
            {
                title: 'Altura de coronamiento',
                sources: ['altura-muro'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".altura-de-coronamiento"
    },
    'ancho-coronamiento': {
        sections: [
            {
                title: 'Ancho de coronamiento',
                sources: ['ancho-coronamiento'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".ancho-de-coronamiento"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".perfiles-topograficos"
    },
    'cotas-piezometricas-en-el-tiempo': {
        Component: EFViews.PiezometricHead,
        sections: [
            {
                title: 'Cotas piezométricas en el tiempo',
                sources: ['presion-poros'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".cotas-piezometricas-en-el-tiempo"
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
                    getCellTimeSeriesName: (colLabel, colIndex, row) => row.value,
                }
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".perfil-topografico-y-cotas-piezometricas"
    },
    'nivel-freatico-de-cubeta': {
        sections: [
            {
                title: 'Nivel freático de cubeta',
                sources: ['nivel-freatico-cubeta-deposito'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".nivel-freatico-de-cubeta"
    },
    'detalle-de-piezometro': {
        Component: EFViews.PiezometerDetail,
        sections: [
            {
                title: 'Detalle de piezómetro',
                sources: ['presion-poros'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".detalle-de-piezometro"
    },
    'porcentaje-de-finos': {
        Component: EFViews.FinesPercentage,
        wikiLink: WIKI_EF_VIEWS+".porcentaje-de-finos"
    },
    'densidad-del-muro': {
        Component: EFViews.WallDensity,
        wikiLink: WIKI_EF_VIEWS+".densidad-del-muro"
    },
    'curva-granulometrica': {
        Component: EFViews.GranulometricCurve,
        wikiLink: WIKI_EF_VIEWS+".curva-granulometrica"
    },
    'caudal': {
        Component: EFViews.Caudal,
        sections: [
            {
                title: 'Caudal',
                sources: ['caudal'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".caudal"
    },
    'turbiedad': {
        Component: EFViews.Turbidity,
        sections: [
            {
                title: 'Turbiedad',
                sources: ['turbiedad'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".turbiedad"
    },
    'detalle-de-caudalimetro': {
        Component: EFViews.FlowmeterDetail,
        sections: [
            {
                title: 'Caudal',
                sources: ['caudal'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".detalle-de-caudalimetro"
    },
    'detalle-de-turbidimetro': {
        Component: EFViews.TurbidimeterDetail,
        sections: [
            {
                title: 'Turbiedad',
                sources: ['turbiedad'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".detalle-de-turbidimetro"
    },
    'intensidad-de-lluvia': {
        Component: EFViews.RainIntensity,
        wikiLink: WIKI_EF_VIEWS+".intensidad-de-lluvia"
    },
    'tonelaje': {
        Component: EFViews.Tonelaje,
        sections: [],
        wikiLink: WIKI_EF_VIEWS+".tonelaje"
    },
    'potencial-de-rebalse': {
        Component: EFViews.OverflowPotential,
        sections: [
            {
                title: 'Potencial de rebalse',
                sources: ['potencial-rebalse', 'potencial-rebalse'],
                config: defaultPlotConfigs.singleSource
            }
        ],
        wikiLink: WIKI_EF_VIEWS+".potencial-de-rebalse"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".grietas-en-el-muro"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".humedad-o-filtraciones-en-talud"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".subsidencia-o-socavacion-cerca-del-muro"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".integridad-de-los-estribos"
    },
    'vertedero': {
        Component: EFViews.Landfill,
        sections: [],
        wikiLink: WIKI_EF_VIEWS+".vertedero-de-emergencia"
    },
    'acelerografos': {
        Component: EFViews.Accelerographs,
        sections: [],
        wikiLink: WIKI_EF_VIEWS+".acelerografos"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".modulos-de-deformacion-y-resistencia"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".resistencia-del-material-de-relaves"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".diseno-del-sistema-de-drenaje"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".caracterizacion-geotecnica-del-suelo-de-fundacion"
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
        ],
        wikiLink: WIKI_EF_VIEWS+".estudio-de-revancha-minima"
    },
}


