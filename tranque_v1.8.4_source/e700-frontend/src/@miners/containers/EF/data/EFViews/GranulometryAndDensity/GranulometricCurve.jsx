import React from "react";
import moment from 'moment/moment';
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography, Link, Switch, FormControlLabel } from "@material-ui/core";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import { getEFLabel } from "@miners/components/EF/EF.labels";
import SelectableTimeseries from '@miners/containers/EF/data/EFViews/DefaultTemporalView/SelectableTimeseries.js';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import * as ParameterService from '@app/services/backend/parameter';
import * as EtlService from "@app/services/backend/etl";
import AboutParameter from '../DefaultTemporalView/AboutParameter'
import { forkJoin } from 'rxjs';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SwitchBox from '../SwitchBox';
import DatePicker from '@app/components/utils/DatePicker.js';
import VegaLegendMiniPlot, { COLORS } from '@app/components/charts/VegaLegendMiniPlot.js';
import DocumentList from '../Documents/DocumentList';
import SwitchesList from '../SwitchesList';

const styles = (theme) => ({
    root: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        backgroundColor: "#303030",
    },
    header: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        margin: "30px",
        marginBottom: "0px",
    },
    title: {
        height: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
    },
    body: {
        display: "flex",
        flexDirection: "column",
    },
    content: {
        width: '100%',
        position: 'relative'
    },
    content__details: {
        margin: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridColumnGap: '1em'
    },
    details__section: {

    },
    details__disclaimer: {
        marginBottom: '1.5rem'
    },
    content__timeseries: {
        backgroundColor: '#262629',
        margin: '30px',
    },
    filter: {
        marginRight: '1em',
        width: '200px',
        '& > div': {
            width: theme.spacing(22)
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
    },
    filters: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: '1em',
        alignItems: 'center'
    },
    switchFilter: {
        display: 'flex',
        alignItems: 'center'
    },
    switchFilterText: {
        marginRight: '1rem'
    },
    tailingContent: {
        width: '100%',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#303030',
    },
});

const SECTION_NAMES = {
    cyclone: 'area-ciclonada',
    tailing: 'emprestito',
};

class GranulometricCurve extends SubscribedComponent {
    state = {
        filters: {
            dateOne: moment().subtract(2, 'month').startOf('day'),
            dateTwo: moment().subtract(1, 'year').startOf('day'),
        },
        hiddenLinesDict: {},
        dateOneReceivedStamp: undefined,
        dateTwoReceivedStamp: undefined,
        measurementsDataDateOne: undefined,
        measurementsDataDateTwo: undefined,
        measurementsMetadata: [],
        upperThresholdDataDateOne: [],
        lowerThresholdDataDateOne: [],
        showMalla200: true,
        switchStatus: undefined,
        switchLoading: true,
        isLoading: false,
        section: SECTION_NAMES.cyclone,
        siteParameters: {},
    }

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    loadSwitchData = () => {
        this.setState({
            switchLoading: true
        });

        const measurementsCanonicalName = `${this.props.target}.none.ef-mvp.m1.design.materiales`;
        this.subscribe(TimeseriesService.read({
            cache: 60 * 1000,
            target: this.props.target,
            timeseries: measurementsCanonicalName,
            max_events: 1
        }), (response) => {
            this.setState({
                switchStatus: response?.events?.[0]?.value === 1 ?? false,
                switchLoading: false
            })
        });
    }

    getSiteParameters() {
        this.subscribe(
            SiteParameterService.get({v1: true}),
            data => {
                this.setState({siteParameters: data});
            }
        );
    }

    generateExportProps = () => ({
        target: this.props.target,
        canonical_name: `${this.props.target}.none.ef-mvp.m2.parameters.granulometria.acumulado-pasante-por-muestra`,
        dateTo: moment(this.state.filters.dateOne).isValid() ? this.state.filters.dateOne : null,
        head: true
    });

    loadTimeseriesData = () => {

        const canonicalName = `${this.props.target}.none.ef-mvp.m2.parameters.granulometria.acumulado-pasante-por-muestra`;
        const upperThresholdName = 'banda-granulometrica-superior';
        const lowerThresholdName = 'banda-granulometrica-inferior';

        this.setState({
            isLoading: true
        })

        this.subscribe(forkJoin({
            metadata: TimeseriesService.read({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                timeseries: canonicalName,
            }),
            measurementsDateOne: TimeseriesService.headRaw({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                timeseries: canonicalName,
                date_to: this.state.filters.dateOne.format(),
            }),
            measurementsDateTwo: TimeseriesService.headRaw({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                timeseries: canonicalName,
                date_to: this.state.filters.dateTwo.format(),
            }),
            upperThresholdDateOne: ParameterService.read({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                id: upperThresholdName,
            }),
            lowerThresholdDateOne: ParameterService.read({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                id: lowerThresholdName,
            }),
        }), ({ metadata, measurementsDateOne, measurementsDateTwo, upperThresholdDateOne, lowerThresholdDateOne, metatdata }) => {
            // upperThresholdDateDateOne
            const measurementsDataDateOne = measurementsDateOne?.data?.results?.[0];
            const measurementsDataDateTwo = measurementsDateTwo?.data?.results?.[0];

            const receviedStampOne = measurementsDateOne?.data?.results?.[0]?.["@timestamp"];
            const receviedStampTwo = measurementsDateTwo?.data?.results?.[0]?.["@timestamp"];
            const description = [{
                name: metadata?.name,
                description: metadata?.description,
            }];
            this.setState({
                measurementsDataDateOne,
                measurementsDataDateTwo,
                description,
                isLoading: false,
                dateOneReceivedStamp: receviedStampOne ? moment(receviedStampOne) : undefined,
                dateTwoReceivedStamp: receviedStampTwo ? moment(receviedStampTwo) : undefined,
                upperThresholdDataDateOne: upperThresholdDateOne?.value?.curve ?? [],
                lowerThresholdDataDateOne: lowerThresholdDateOne?.value?.curve ?? []
            })
        })


    }

    toggleSeries = (name) => {
        this.setState((state) => {
            return {
                hiddenLinesDict: {
                    ...state.hiddenLinesDict,
                    [name]: !state.hiddenLinesDict[name]
                }
            }
        })

    }

    requestEventTrigger = (value) => {
        const name = `${this.props.target}.none.ef-mvp.m1.design.materiales`;

        this.setState({
            switchLoading: true
        });
        this.subscribe(
            EtlService.createImmediately({
                target: this.props.target,
                executor: "direct",
                context: {
                    events: [
                        {
                            name,
                            value: value ? 1 : 0,
                        },
                    ],
                },
            }),
            (response) => {
                if (response.finished && response.state === "success") {
                    this.setState({
                        switchStatus: response?.initial_context?.events?.[0]?.value === 1,
                        switchLoading: false
                    });
                }
            }
        );
    };

    onSwitchChange = () => {
        this.requestEventTrigger(!this.state.switchStatus);
    }

    toggleMalla200 = () => {
        this.setState(state => {
            return {
                ...state,
                showMalla200: !state.showMalla200
            }
        })
    }

    componentDidMount = () => {
        this.loadTimeseriesData();
        this.loadSwitchData();
        this.getSiteParameters();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.filters !== this.state.filters) {
            const validTempDates = moment(this.state.filters.endDate).isValid() && moment(this.state.filters.startDate).isValid();
            if (validTempDates) {
                this.loadTimeseriesData()
            }
        }
    }
    render = () => {
        const { classes, wikiLink } = this.props;
        const title = getEFLabel(this.props.template);

        const verticalLinesData = [
            { name: 'malla200', value: 0.074 }
        ];

        const timeseriesData = {
            date1: [{
                label: ' ',
                data: this.state.measurementsDataDateOne?.meta?.['acumulado-pasante']?.map((data) => {
                    return [{
                        x: data.abertura,
                        y: data.porcentaje,
                        name: 'date1'
                    }];
                }) ?? []
            }],
            date2: [{
                label: ' ',
                data: this.state.measurementsDataDateTwo?.meta?.['acumulado-pasante']?.map((data) => {
                    return [{
                        x: data.abertura,
                        y: data.porcentaje,
                        name: 'date1'
                    }];
                }) ?? []
            }],
            upperThresholdDateOne: [{
                label: ' ',
                data: this.state.upperThresholdDataDateOne.map((data) => {
                    return [{
                        x: data.abertura,
                        y: data.pasa,
                        name: 'upperThresholdDateOne'
                    }];
                }) ?? []
            }],
            lowerThresholdDateOne: [{
                label: ' ',
                data: this.state.lowerThresholdDataDateOne.map((data) => {
                    return [{
                        x: data.abertura,
                        y: data.pasa,
                        name: 'lowerThresholdDateOne'
                    }];
                }) ?? []
            }],
        };

        const metaData = [
            [{ name: 'date2', unit: { abbreviation: '%' } }, { name: 'upperThresholdDateOne' }, { name: 'lowerThresholdDateOne' }],
            [{ name: 'date1' }, { name: 'upperThresholdDateOne' }, { name: 'lowerThresholdDateOne' }],
        ];

        const getColumnLabels = () => ['Medición', 'Umbral superior', 'Umbral inferior'];
        const getCellTimeSeriesName = (colName, colIndex, row) => {
            return row?.[colIndex]?.name;
        }

        const getRowGroupLabel = (row, index) => {
            if (index === 0) {
                const dateString = this.state.dateOneReceivedStamp?.format('DD.MM.YYYY');
                return `Día a graficar (${dateString})`;
            }

            const dateString = this.state.dateTwoReceivedStamp?.format('DD.MM.YYYY');

            return `Comparar con (${dateString})`;
        }

        const otherLinesStyles = this.state.showMalla200 ? [
            { name: 'malla200', color: COLORS[1], shape: 'none' }
        ] : [];

        const linesStylesModifier = (styles) => styles.map(row => row.map((style, colIndex) => {

            const shape = colIndex === 0 ? 'square' : 'none';
            return {
                ...style,
                shape
            }
        }));

        return (
            <Card className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.title}>
                        <Typography variant="h5">{title}</Typography>
                        <AboutParameter description={this.state.description} wikiLink={this.state.siteParameters[wikiLink]}></AboutParameter>
                    </div>
                    <div className={classes.filters}>
                        <div className={classes.filter}>
                            <DatePicker
                                inputVariant="outlined"
                                views={["date"]}
                                label="Día a graficar"
                                format="DD.MM.YYYY"
                                maxDate={this.state.filters.dateOne}
                                value={this.state.filters.dateOne}
                                onChange={(date) => this.setFilters({
                                    ...this.state.filters,
                                    dateOne: date
                                })}

                            />
                        </div>

                        <div className={classes.filter}>
                            <DatePicker
                                inputVariant="outlined"
                                views={["date"]}
                                label="Comparar con"
                                format="DD.MM.YYYY"
                                maxDate={this.state.filters.dateTwo}
                                value={this.state.filters.dateTwo}
                                onChange={(date) => this.setFilters({
                                    ...this.state.filters,
                                    dateOne: date
                                })}
                            />
                        </div>

                        <div className={classes.filter}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={this.state.showMalla200}
                                        onChange={this.toggleMalla200}
                                    />
                                }
                                label={
                                    <div className={classes.switchFilter}>
                                        <span className={classes.switchFilterText}>Malla #200</span>
                                        <VegaLegendMiniPlot color={COLORS[1]} shape='none' />
                                    </div>
                                }
                                labelPlacement="end"
                            />
                        </div>
                        <div>
                            <Typography variant="body2">Tipo de muro</Typography>
                            <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                                <Button
                                    color={this.state.section === SECTION_NAMES.cyclone ? "primary" : "secondary"}
                                    onClick={() => this.setState({ section: SECTION_NAMES.cyclone })}>
                                    Área ciclonada
                                </Button>
                                <Button
                                    color={this.state.section === SECTION_NAMES.tailing ? "primary" : "secondary"}
                                    onClick={() => this.setState({ section: SECTION_NAMES.tailing })}>
                                    Empréstito
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
                {
                    this.state.section === SECTION_NAMES.cyclone &&
                    <div className={classes.content}>
                        <Card className={classes.content__timeseries}>
                            <SelectableTimeseries
                                title={"Densidad del muro"}
                                xAxisTitle='Diámetro de apertura'
                                yAxisTitle='Porcentaje que pasa'
                                timeseriesData={timeseriesData}
                                verticalLinesData={verticalLinesData}
                                metaData={metaData}
                                isTemporal={false}
                                getColumnLabels={getColumnLabels}
                                getCellTimeSeriesName={getCellTimeSeriesName}
                                getRowGroupLabel={getRowGroupLabel}
                                // getRowLabels={getRowLabels}
                                hiddenLinesDict={this.state.hiddenLinesDict}
                                toggleSeries={this.toggleSeries}
                                xScale={{
                                    type: 'log'
                                }}
                                xAxisUnits='mm'
                                otherLinesStyles={otherLinesStyles}
                                linesStylesModifier={linesStylesModifier}
                                exportProps={this.generateExportProps()}
                                isLoading={this.state.isLoading}
                            />
                        </Card>

                        <div className={classes.content__details} >
                            <div className={classes.details__section}>
                                <div className={classes.details__disclaimer}>
                                    <Typography variant="body1" color="textSecondary">
                                        Si detectas situaciones como la(s) descrita(s) a continuación, puedes informarlo al sistema, lo que permitirá gestionar tickets de incidentes o alerta. 
                                        &nbsp;<Link color="textPrimary" target="_blank" href={this.state.siteParameters['glossary.tickets']}>Saber más</Link>
                                    </Typography>
                                </div>

                                <SwitchBox
                                    header="Incumplimiento en uso de Material Apropiado para construcción del muro de arena cicloneada"
                                    bodyContent="Los informes de curva granulométrica para muro de arena cicloneada pueden evidenciar el incumplimiento de parámetros de diseño. Si esto sucede, puedes activar el switch para dar más antecedentes al sistema"
                                    // checked={true}
                                    switchProps={{
                                        checked: this.state.switchStatus,
                                        disabled: this.state.switchLoading || this.props.disableActions,
                                        onChange: this.onSwitchChange
                                    }}

                                />
                            </div>

                        </div>
                    </div>
                }
                {
                    this.state.section === SECTION_NAMES.tailing && <Card className={classes.content__timeseries}>
                        <div className={classes.tailingContent}>
                            <div>
                                <SwitchesList
                                    sections={[
                                        {
                                            templateName: "ef-mvp.m1.design.materiales",
                                            label: "Incumplimiento en uso de Material Apropiado para construcción del muro de empréstito",
                                            subLabel: `Los informes de curva granulométrica para muro empréstito pueden evidenciar
                                                        el incumplimiento de parámetros de diseño. Si esto sucede, puedes activar
                                                        el switch para dar más antecedentes al sistema.`,
                                        }
                                    ]}
                                    target={this.props.target}
                                    disableActions={this.props.disableActions}
                                ></SwitchesList>
                            </div>
                            <div>
                                <Typography variant="body1">Documentos</Typography>
                                <DocumentList section={{}} disableActions={this.props.disableActions}></DocumentList>
                            </div>
                        </div>
                    </Card>
                }
            </Card>
        );
    };
}

export default withStyles(styles)(GranulometricCurve);
