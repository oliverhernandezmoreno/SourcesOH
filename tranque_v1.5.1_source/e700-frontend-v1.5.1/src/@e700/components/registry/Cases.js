import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Grid, Typography, Button, Chip} from '@material-ui/core';
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
        openChecked: false
    };

    regionFilter() {
        return (event) => {
            this.setState({region: event.target.value});
            this.props.selectRegion(event.target.value);
        };
    };

    getFormattedRegions() {
        return this.state.regionOptions.map((region) => {
            return {label: region.name, value: region.natural_key};
        })
    }

    componentDidMount() {
        this.subscribe(
            ZoneService.listAll({type: 'region'}),
            regions => {
                this.setState({
                    regionOptions: regions
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
                title: case_.title,
                workSite: [entity, faena],
                id_sngm: case_.target_meta && case_.target_meta.id_sngm ?
                    case_.target_meta.id_sngm.value : "--",
                target: case_.target_name,
                button: <Button
                    style={{width: '150px', whiteSpace: 'nowrap', color: '#ffffff', backgroundColor: '#1A76D1'}}
                    variant="outlined"
                    component={Link} to={reverse('e700.case', {id: case_.id})}>
                    REVISAR
                </Button>,
                creationDate: case_.created_at,
                state: state
            };
        };
    }

    handleSwitchChange(checked) {
        this.setState({openChecked: checked});
    }

    renderFilters() {
        return (<>
            <Grid item style={{paddingBottom: 16, minWidth: 350}}>
                <TSelect
                    field='Región'
                    defaultValue='Todas las regiones'
                    menuItems={this.getFormattedRegions()}
                    onChange={this.regionFilter()}
                    inputProps={{id: 'region'}}
                    selected={this.state.region}/>
            </Grid>
            <Grid item style={{paddingRight:'30px'}}>
                <TSwitch
                    label={'Sólo abiertos'}
                    onChange={(event) => this.handleSwitchChange(event.target.checked)}
                    checked={this.state.openChecked}/>
            </Grid>
        </>
        );
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
            const tableData = cases.map(this.caseToTableRow(classes))
                .filter(c => (this.state.openChecked && c.state === 'ABIERTO') ||
                                                    !this.state.openChecked);
            return (
                <TMaterialTable
                    data={tableData}
                    columns={tableColumns}
                    components={{
                        Toolbar: props => (<>
                            <Grid container alignItems='center' spacing={2} justify='space-between' className={classes.toolbarPadding}>
                                <Grid item xs={12} sm={12} md={4}>
                                    <MTableToolbar {...props} classes={{root: classes.toolbar}}/>
                                </Grid>
                                {this.renderFilters()}
                            </Grid>
                        </>)
                    }}
                    localization={{body: {emptyDataSourceMessage: 'No se han encontrado Casos generados'}}}
                />
            );
        }
    }

    render() {
        const {classes, cases, name} = this.props;
        //TODO crear un objeto para juntar tanto la información de la instancia con la del tranque (nombre empresa, faena, etc)
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
