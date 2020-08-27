import React from 'react';
import moment from 'moment/moment';
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import {
    withStyles, Card, Typography, TextField, Box, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Link, TablePagination
} from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import ButtonDownloadDocument from '@miners/components/utils/ButtonDownloadDocument.js'
import AboutParameter from '@miners/containers/EF/data/EFViews/DefaultTemporalView/AboutParameter.js'
import DatePicker from '@app/components/utils/DatePicker.js';
import { getEFLabel } from "@miners/components/EF/EF.labels";
import { forkJoin } from 'rxjs';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as EtlService from "@app/services/backend/etl";
import * as SiteParameterService from '@app/services/backend/siteParameter';
import SwitchBox from '@miners/containers/EF/data/EFViews/SwitchBox.js';
import DataSourceSheet from '@miners/containers/EF/data/EFViews/DataSourceSheet';
import {ConsoleHelper} from '@app/ConsoleHelper';

const latLonToString = (lat, lon) => {

    const latSignString = lat > 0 ? 'N' : 'S';
    const lonSignString = lon > 0 ? 'E' : 'O';

    return `${Math.abs(lat).toFixed(6)}°${latSignString} ${Math.abs(lon).toFixed(6)}°${lonSignString}`
}

const styles = (theme) => ({
    root: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        backgroundColor: "#303030",
        padding: '30px'
    },
    header: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%",
        marginBottom: "2rem",
    },
    title: {
        marginBottom: "2rem",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
    },
    body: {
        display: "flex",
        flexDirection: "column",
    },
    content: {
        width: '100%',
        position: 'relative'
    },
    content__timeseries: {
        backgroundColor: '#262629',
        padding: '1rem'
    },
    SelectableTimeseriesButton__export: {
        color: '#01aff4',
        border: '1px solid #01aff4',
        marginLeft: '1rem'
    },
    SelectableTimeseriesButton__label: {
        marginLeft: '0.5em'
    },
    filter: {
        marginRight: '1em',
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
    instrumentsSelect: {
        width: '30ch'
    },
    SelectableTimeseriesRoot: {
        width: '100%',
        height: '70%',
        position: 'relative',
    },
    SelectableTimeseriesContent__subtitle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '1em'
    },
    tableContainer: {
        backgroundColor: '#303030',
        paddingTop: '0.5em',
        border: "1px solid #6d6d6d;",
        maxHeight: '400px',
        "&::-webkit-scrollbar": {
            width: "0.5em",
            // background: "none",
        },

        /* Track */
        "&::-webkit-scrollbar-track": {
            background: "none"
        },

        /* Handle */
        "&::-webkit-scrollbar-thumb": {
            background: "#656565",
            borderRadius: "0.5em",
        },

        /* Handle on hover */
        "&::-webkit-scrollbar-thumb:hover": {
            background: "#656565"
        },
        /* Hover on grid */
        "&:hover::-webkit-scrollbar-thumb": {
            background: "#656565"
        }
    },
    dateTimeColumn: {
        width: '30ch'
    },
    registryColumn: {
        width: '30ch'
    },
    content__details: {
        margin: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridColumnGap: '1em'
    },
    details__section: {
        '& > div': {
            marginBottom: '1rem'
        }
        // width: '50%'
    },
    details__disclaimer: {
        marginBottom: '1.5rem'
    }
});

const rowsPerPageOptions = [5, 10, 25];

class Accelerographs extends SubscribedComponent {

    requestEventTrigger = (name, value, callback) => {
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
            callback
        );
    };

    state = {
        description: [],
        instruments: [],
        instrument: {},
        isLoadingInstruments: false,

        date: moment().subtract(0, 'year').startOf('day'),
        documents: [],
        isLoadingDocuments: false,

        page: 0,
        rowsPerPage: rowsPerPageOptions[0],

        smallEarthquake: false,
        smallEarthquakeLoading: false,
        bigEarthquake: false,
        bigEarthquakeLoading: false,

        accelerographSwitch: false,
        accelerographSwitchLoading: false,

        file: {},
        siteParameters: {}
    }

    setFilters = (date) => {
        this.setState({
            date
        });

    }

    setInstrument = (event, instrument) => {
        this.setState({
            instrument
        })
    }

    loadDocuments = () => {
        if (!this.state.instrument?.canonical_name) {
            return;
        }

        this.setState({
            isLoadingDocuments: true
        })

        this.subscribe(forkJoin({
            documents: TimeseriesService.listDocument({
                cache: 60 * 1000, // one minute
                target: this.props.target,
                canonical_name: this.state.instrument.canonical_name,
                type: 'medicion',
                created_at_from: this.state.date.startOf('month').format('YYYY-MM-DD'),
                created_at_to: this.state.date.endOf('month').format('YYYY-MM-DD')
            }),
            files: TimeseriesService.listDocument({
                cache: 60 * 1000, // one minute
                target: this.props.target,
                canonical_name: this.state.instrument.canonical_name,
                type: 'ficha',
            })
        }), ({ documents, files }) => {
            const file = files.reduce((prevFile, file) => {
                if (file.created_at >= prevFile.created_at) {
                    return file
                }
                return prevFile;
            }, files?.[0] ?? {});
            this.setState({
                isLoadingDocuments: false,
                documents,
                file
            })
        })

    }
    loadData = () => {
        this.setState({
            isLoadingInstruments: true
        })

        const templateName = 'ef-mvp.m2.parameters.aceleracion-sismica';

        const listRequest = TimeseriesService.list({
            cache: 60 * 1000, // one minute
            target: this.props.target,
            template_name: templateName,
            max_events: 1,
        })

        this.subscribe(
            forkJoin({
                instruments: listRequest
            }),
            ({ instruments }) => {
                this.setState({
                    instruments,
                    instrument: instruments[0] ?? {},
                    isLoadingInstruments: false
                })
            }
        )
    }

    loadAccelerographSwitchData = () => {
        const locationToTemplateMap = {
            "roca": "ef-mvp.m2.parameters.aceleracion-sismica.D1",
            "suelo-fundacion": "ef-mvp.m2.parameters.aceleracion-sismica.D2",
            "coronamiento": "ef-mvp.m2.parameters.aceleracion-sismica.D3",
        }

        const location = this.state.instrument?.data_source?.groups.find(g => g !== 'acelerografos');
        if (!location) return;

        const accelerographSwitchCanonicalName = `${this.props.target}.g-${location}.${locationToTemplateMap[location]}`;

        this.setState({
            accelerographSwitchLoading: true
        });

        this.subscribe(TimeseriesService.read({
            cache: 60 * 1000,
            target: this.props.target,
            timeseries: accelerographSwitchCanonicalName,
            max_events: 1
        }), (switchData) => {
            this.setState({
                accelerographSwitch: switchData?.events?.[0]?.value === 1,
                accelerographSwitchLoading: false
            });
        }, (error) => {
            ConsoleHelper(error, "warn");
        });
    }

    loadSwitchesData = () => {
        const smallEarthquakeName = `${this.props.target}.none.ef-mvp.m1.triggers.important.terremoto-4-6`;
        const bigEarthquakeName = `${this.props.target}.none.ef-mvp.m1.triggers.critical.terremoto-7`;

        this.setState({
            smallEarthquakeLoading: true,
            bigEarthquakeLoading: true,
        });

        this.subscribe(
            forkJoin({
                smallEarthquake: TimeseriesService.read({
                    cache: 60 * 1000,
                    target: this.props.target,
                    timeseries: smallEarthquakeName,
                    max_events: 1
                }),
                bigEarthquake: TimeseriesService.read({
                    cache: 60 * 1000,
                    target: this.props.target,
                    timeseries: bigEarthquakeName,
                    max_events: 1
                })
            }), ({ smallEarthquake, bigEarthquake }) => {

                this.setState({
                    smallEarthquake: smallEarthquake?.events?.[0]?.value === 1,
                    bigEarthquake: bigEarthquake?.events?.[0]?.value === 1,
                    smallEarthquakeLoading: false,
                    bigEarthquakeLoading: false,
                })
            });
    }

    handleChangePage = (_event, page) => {
        this.setState({
            page
        });
    }

    handleChangeRowsPerPage = (event) => {
        const newPages = event.target.value;
        this.setState({
            rowsPerPage: newPages
        });
    }

    handleSwitchChange = (switchType) => {
        if (switchType === 'small') {
            const newStatus = !this.state.smallEarthquake;
            this.setState({
                smallEarthquakeLoading: true
            })
            this.requestEventTrigger(
                `${this.props.target}.none.ef-mvp.m1.triggers.important.terremoto-4-6`,
                newStatus,
                (response) => {
                    if (response.finished && response.state === "success") {
                        this.setState({
                            smallEarthquake: newStatus,
                            smallEarthquakeLoading: false
                        });
                    }
                }
            );
            return;
        }

        if (switchType === 'big') {
            const newStatus = !this.state.bigEarthquake;
            this.setState({
                bigEarthquakeLoading: true
            })
            this.requestEventTrigger(
                `${this.props.target}.none.ef-mvp.m1.triggers.critical.terremoto-7`,
                newStatus,
                (response) => {
                    if (response.finished && response.state === "success") {
                        this.setState({
                            bigEarthquake: newStatus,
                            bigEarthquakeLoading: false
                        });
                    }
                }
            );
            return;
        }
    }

    getSiteParameters() {
        this.subscribe(
            SiteParameterService.get({v1: true}),
            data => {
                this.setState({siteParameters: data});
            }
        );
    }

    componentDidMount = () => {
        this.loadData();
        this.loadSwitchesData();
        this.getSiteParameters();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.instrument !== this.state.instrument ||
            prevState.date !== this.state.date) {
            this.loadDocuments();
        }

        if (prevState.instrument !== this.state.instrument) {
            this.loadAccelerographSwitchData();
        }
    }

    render() {
        const { classes, wikiLink } = this.props;
        const {instrument} = this.state;
        const title = getEFLabel(this.props.template);


        const lat = instrument?.data_source?.deg_coords?.lat;
        const lon = instrument?.data_source?.deg_coords?.lng;
        const locationIndex = instrument?.data_source?.groups.findIndex(g => g !== 'acelerografos');
        const location = instrument?.data_source?.group_names?.[locationIndex];
        const fileData = {
            location: location ?? '-',
            coords: lat !== undefined && lon !== undefined && `${latLonToString(lat, lon)}`
        };
        return (
            <Card className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.title}>
                        <Typography variant="h5">{title}</Typography>
                        <AboutParameter description={this.state.description} wikiLink={this.state.siteParameters[wikiLink]}></AboutParameter>
                    </div>
                    <div className={classes.filters}>
                        <div className={[classes.filter, classes.instrumentsSelect].join(' ')}>
                            <Autocomplete
                                value={instrument}
                                onChange={this.setInstrument}
                                // inputValue={''}
                                // onInputChange={(event, newInputValue) => {
                                //     ConsoleHelper("newInputValue " + newInputValue, "log");
                                //     if(newInputValue === '') return;
                                //     // setInputValue(newInputValue);
                                // }}
                                getOptionLabel={(option) => option?.data_source?.name ?? ''}
                                getOptionSelected={(option, value) => {
                                    if (Object.keys(option).length === 0 && Object.keys(value).length === 0) {
                                        return true;
                                    }

                                    return option === value;
                                }}
                                loading={this.state.isLoadingInstruments}
                                loadingText='Cargando . . .'
                                options={this.state.instruments.concat({})}
                                renderInput={(params) => <TextField {...params} style={{ width: '100%' }} label="Instrumento" variant="outlined" />}
                            />
                        </div>

                        <div className={classes.filter}>
                            <DatePicker
                                inputVariant="outlined"
                                views={["year"]}
                                label="Año"
                                format="YYYY"
                                maxDate={moment().endOf('year')}
                                value={this.state.date}
                                onChange={this.setFilters}
                            />
                        </div>

                        <div className={classes.filter}>
                            <DatePicker
                                inputVariant="outlined"
                                views={["month"]}
                                label="Mes"
                                format="MMMM"
                                maxDate={this.state.date.clone().endOf('year')}
                                minDate={this.state.date.clone().startOf('year')}
                                value={this.state.date}
                                onChange={this.setFilters}
                            />
                        </div>
                    </div>


                </div>
                <div className={classes.content}>
                    <Card className={classes.content__timeseries}>
                        <div className={classes.SelectableTimeseriesRoot}>
                            <div className={classes.SelectableTimeseriesContent__subtitle}>
                                <Typography variant="subtitle1" color="textSecondary"> Mediciones del instrumento </Typography>
                                <ButtonDownloadDocument
                                    id={this.state.documents.map(row => row.id)}
                                    target={this.props.target}
                                    canonical_name={instrument?.canonical_name}
                                    filename={this.state.documents.map(row => row.name)}
                                    label='Descargar'
                                />
                            </div>
                            <div className={classes.SelectableTimeseriesCard__div}>
                            </div>

                        </div>

                        <TableContainer component={Paper} className={classes.tableContainer}>
                            <Table size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left" className={[classes.dateTimeColumn, classes.columnHeader].join(' ')}>
                                            <Typography component="div" >
                                                <Box fontWeight="fontWeightBold">
                                                    Fecha y hora
                                                </Box>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left" className={[classes.registryColumn, classes.columnHeader].join(' ')}>
                                            <Typography component="div">
                                                <Box fontWeight="fontWeightBold">
                                                    Registro de mediciones
                                                </Box>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left" className={[classes.downloadColumn, classes.columnHeader].join(' ')}>

                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody className={classes.tableBody}>
                                    {
                                        this.state.documents.length === 0 && (
                                            <TableRow className={styles.emptyTable}>
                                                <TableCell colSpan={3} variant="body" align="center" size="medium" >
                                                    <Typography component="div" >
                                                        No se encontraron registros
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                    {
                                        this.state.documents.length > 0 &&
                                        this.state.documents
                                            .slice(this.state.page * this.state.rowsPerPage, (this.state.page + 1) * this.state.rowsPerPage)
                                            .map((row, rowIndex) => (
                                                <TableRow key={rowIndex}>
                                                    <TableCell>
                                                        {moment(row.created_at).format('YYYY.MM.DD HH.mm.SS')}
                                                    </TableCell>
                                                    <TableCell align="left">{row.name}</TableCell>
                                                    <TableCell align="left">
                                                        <ButtonDownloadDocument
                                                            id={row.id}
                                                            target={this.props.target}
                                                            canonical_name={instrument?.canonical_name}
                                                            filename={row.name}
                                                            label=''
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={rowsPerPageOptions}
                            component="div"
                            count={this.state.documents.length}
                            rowsPerPage={this.state.rowsPerPage}
                            page={this.state.page}
                            onChangePage={this.handleChangePage}
                            // onChangePage={ConsoleHelper("onChangePage", "log")}
                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        // onChangeRowsPerPage={ConsoleHelper("onChangeRowsPerPage", "log")}
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
                                header='Se detectó un sismo leve'
                                bodyContent='Sismo de Intensidad Mercalli IV a VI: Corresponde a un sismo menor, que puede ser detectado por un operador, pero que no genera un movimiento lo suficientemente­ fuerte como para que el operador pierda su estabilidad y no pueda mantenerse en pie. Este switch puede ser activado automáticamente (según datos de acelerógrafo) o manualmente, en esta misma casilla, desde el checklist diario o con el botón "reportar emergencia"'
                                switchProps={{
                                    onChange: () => this.handleSwitchChange('small'),
                                    checked: this.state.smallEarthquake,
                                    disabled: this.state.smallEarthquakeLoading || this.props.disableActions
                                }}

                            />

                            <SwitchBox
                                header='Sismo fuerte, operador no puede mantenerse en pie'
                                bodyContent='Sismo de Intensidad Mercalli mayor a VI: Corresponde a un sismo mayor, que genera un movimiento lo suficientemente fuerte para que un operador pierda por completo su estabilidad y no pueda continuar en pie. Este switch NO puede ser activado automáticamente (según datos de acelerógrafo), sólo manualmente, en esta misma casilla, desde el checklist diario o con el botón "reportar emergencia"'
                                switchProps={{
                                    onChange: () => this.handleSwitchChange('big'),
                                    checked: this.state.bigEarthquake,
                                    disabled: this.state.bigEarthquakeLoading || this.props.disableActions
                                }}

                            />

                            <SwitchBox
                                header={`Se superó máxima aceleración medida en ${fileData.location.toLowerCase()}`}
                                bodyContent={`Este switch se mostrará activado en caso de que exista una superación de la máxima aceleración medida en ${fileData.location.toLowerCase()}`}
                                switchProps={{
                                    checked: this.state.accelerographSwitch,
                                    disabled: this.state.accelerographSwitchLoading
                                }}
                            />
                        </div>
                        <DataSourceSheet excludeSector excludeDrenaje
                            target={this.props.target}
                            dataSource={instrument?.data_source}
                            fileData={fileData}
                            isLoading={this.state.isLoadingInstruments}
                        />
                    </div>
                </div>
            </Card>
        )
    }
}

export default withStyles(styles)(Accelerographs);
