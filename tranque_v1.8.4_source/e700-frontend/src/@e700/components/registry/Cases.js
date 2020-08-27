import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Box, Grid, Typography, Button, Chip} from '@material-ui/core';
import TSelect from '@app/components/utils/TSelect';
import TSwitch from '@app/components/utils/TSwitch';
import {ISO_DATE_FORMAT} from '@app/config';
import * as ZoneService from '@app/services/backend/zone';
import * as moment from 'moment';
import {Link} from 'react-router-dom';
import {reverse} from '@app/urls';
import {getDateSortNumber} from '@app/services/sorting';
import {MTableToolbar} from 'material-table';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {trimesters} from '@e700/utils/trimesterSelectItems';
import theme from '@e700/theme';

const styles = theme => ({
    root: {
        padding:'50px',
        paddingTop: 0
    },
    toolbar: {
        [theme.breakpoints.up('md')]: {
            paddingLeft: '0px'
        },
        [theme.breakpoints.up('sm')]: {
            paddingLeft: '0px'
        },
        paddingLeft: '0px',
        width: '100%'
    },
    toolbarPadding: {
        paddingTop: 20
    },
    card1: {
        width: '100%',
        paddingLeft: theme.spacing(2.5),
        paddingRight: theme.spacing(2.5)
    },
    text_form: {
        fontWeight: '300',
        lineHeight: '29px',
        textAlign: 'left',
        marginTop: '30px'
    },
    state: {
        fontWeight: 'bold',
        marginBottom: '0.5em',
        padding: '1em'
    },
    select: {
        minWidth: '250px',
        textAlign: 'center',
        marginLeft: theme.spacing(4),
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(1)
    }
});

class Cases extends SubscribedComponent {

    state = {
        region: '',
        regionOptions: [],
        openChecked: false,
        selectedYear: '',
        selectedTrimester: '',
    };

    regionFilter() {
        return (event) => {
            this.setState({region: event.target.value});
            this.props.selectRegion(event.target.value);
        };
    };

    componentDidMount() {
        this.subscribe(
            ZoneService.listAll({type: 'region'}),
            regions => {
                this.setState({
                    regionOptions: ZoneService.parseZoneOptions(regions),
                });
            }
        );
    }

    caseToTableRow(classes) {
        return (case_) => {
            const state = case_.state === 'closed' ? 'CERRADO' : 'ABIERTO';
            let entity = '--';
            let faena = '--';
            if (case_.work_sites.length > 0) {
                if (case_.work_sites[0].entity) {
                    entity = case_.work_sites[0].entity.name;
                }
                faena = case_.work_sites[0].name;
            }
            return {
                period: `${case_.year} - Trimestre ${case_.trimester}`,
                title: case_.title,
                workSite: [entity, faena],
                id_sngm: case_.target_meta && case_.target_meta.id_sngm ?
                    case_.target_meta.id_sngm.value : "--",
                target: case_.target_name,
                button: <Button
                    style={{width: '120px', whiteSpace: 'nowrap', color: '#ffffff', backgroundColor: '#1A76D1'}}
                    variant="outlined"
                    component={Link} to={reverse('e700.case', {id: case_.id})}>
                    REVISAR
                </Button>,
                creationDate: case_.created_at,
                state: state
            };
        };
    }

    isSearched(data, input) {
        if (input === '') return true;
        this.currentSearch = input;
        return ((data.workSite[0] && data.workSite[0].toLowerCase().search(input.toLowerCase()) >= 0) ||
                (data.workSite[1] && data.workSite[1].toLowerCase().search(input.toLowerCase()) >= 0));
    }

    renderTable(cases) {
        const {loading, classes} = this.props;
        if (loading) {
            return <Typography>cargando...</Typography>;
        } else {
            const tableColumns = [
                {
                    title: <Typography variant="body2">Periodo Formulario Asociado</Typography>,
                    field: 'period'
                },
                {
                    title: <Typography variant="body2">Título Caso</Typography>,
                    field: 'title'
                },
                {
                    title: <Typography variant="body2">Fecha Creación</Typography>,
                    field: 'creationDate',
                    render: data => moment(data.creationDate).format(ISO_DATE_FORMAT),
                    customSort: (data1, data2) => getDateSortNumber(data1.creationDate, data2.creationDate),
                    searchable: false
                },
                {
                    title: <Typography variant="body2">Empresa/Faena</Typography>,
                    field: 'workSite',
                    render: data => (<Typography>{data.workSite[0]}/{data.workSite[1]}</Typography>),
                    customFilterAndSearch: (event, data) => this.isSearched(data, event),
                    sorting: false
                },
                {
                    title: <Typography variant="body2">Depósito</Typography>,
                    field: 'target',
                    sorting: false
                },
                {
                    title: <Typography variant="body2">ID Depósito</Typography>,
                    field: 'id_sngm',
                    sorting: false
                },
                {
                    title: <Typography variant="body2">Estado</Typography>,
                    field: 'state',
                    render: data => (<Chip className={classes.state}
                        variant="outlined"
                        label={data.state}/>),
                    searchable: false,
                    sorting: false
                },
                {
                    field: 'button',
                    sorting: false,
                    searchable: false
                }
            ];

            const tableData = cases.filter((c) => {
                return ((this.state.selectedYear !== '' && this.state.selectedYear === c.year) ||
                this.state.selectedYear === '') && ((this.state.selectedTrimester !== '' &&
                this.state.selectedTrimester === c.trimester) || this.state.selectedTrimester === '')
                && ((this.state.openChecked && c.state === 'open') || !this.state.openChecked)
            }).map(this.caseToTableRow(classes));

            return (
                <TMaterialTable
                    data={tableData}
                    columns={tableColumns}
                    options={{searchFieldStyle: {fontSize: 14, width: '100%', paddingTop: '8px'},
                        doubleHorizontalScroll: false,
                        headerStyle: { fontWeight: 'bold',
                            backgroundColor: theme.palette.primary.main,
                            color: '#ffffff' }
                    }}
                    components={{
                        Toolbar: props => (<>
                            <Grid container alignItems='center' spacing={2} justify='space-between' className={classes.toolbarPadding}>
                                <Grid item>
                                    <MTableToolbar {...props} classes={{root: classes.toolbar}}/>
                                </Grid>
                            </Grid>
                            <Grid container alignItems='center' spacing={2} justify='space-between' className={classes.toolbarPadding}>
                                {this.renderFilters()}
                            </Grid>
                        </>)
                    }}
                    localization={{body: {emptyDataSourceMessage: 'No se han encontrado Casos generados'}}}
                />
            );
        }
    }

    handleSwitchChange(checked) {
        this.setState({openChecked: checked});
    }

    getYears() {
        let years = new Set([]);
        this.props.cases.forEach((formCase) => {
            years.add(formCase.year)
        });
        return Array.from(years)
            .slice().sort((a, b) => b - a)
            .map((year) => {return {label: year, value: year};});
    }

    onYearChange(value) {
        this.setState({selectedYear: value});
    }

    onTrimestreChange(value) {
        this.setState({selectedTrimester: value});
    }

    renderFilters() {
        return (<Box style={{display: 'contents'}}>
            <Grid item style={{paddingBottom: '50px', paddingRight: '30px', minWidth: 350}}>
                <TSelect
                    field='Región'
                    defaultValue='Todas las regiones'
                    menuItems={this.state.regionOptions}
                    onChange={this.regionFilter()}
                    inputProps={{id: 'region'}}
                    selected={this.state.region}/>
            </Grid>
            <Grid item style={{paddingBottom: '50px', paddingLeft: '30px', paddingRight: '30px', width: 250}}>
                <TSelect
                    field='Año'
                    defaultValue='Todos los años'
                    menuItems={this.getYears()}
                    onChange={(event) => this.onYearChange(event.target.value)}
                    selected={this.state.selectedYear}/>
            </Grid>
            <Grid item style={{paddingBottom: '50px', paddingLeft: '30px', paddingRight: '30px', width: 250}}>
                <TSelect
                    field='Trimestre'
                    defaultValue='Todos los trimestres'
                    menuItems={trimesters}
                    onChange={(event) => this.onTrimestreChange(event.target.value)}
                    selected={this.state.selectedTrimester}/>
            </Grid>
            <Grid item style={{paddingBottom: '50px', paddingLeft: '30px', paddingRight:'30px'}}>
                <TSwitch
                    label={'Sólo abiertos'}
                    onChange={(event) => this.handleSwitchChange(event.target.checked)}
                    checked={this.state.openChecked}/>
            </Grid>
        </Box>
        );
    }

    render() {
        const {classes, cases, name} = this.props;

        return (
            <Grid container spacing={1} className={classes.root}>
                <Grid item x={12} className={classes.card1}>
                    <Typography variant='h4' className={classes.text_form}>
                        FORMULARIOS E700 > CASOS
                    </Typography>
                    <Typography variant='h6' className={classes.subtitle}>
                        {name}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {this.renderTable(cases)}
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(Cases);
