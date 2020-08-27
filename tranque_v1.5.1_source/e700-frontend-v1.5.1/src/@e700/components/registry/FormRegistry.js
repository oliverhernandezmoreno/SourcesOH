import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Typography, Grid, Button, Checkbox} from '@material-ui/core';
import TSelect from '@app/components/utils/TSelect';
import {ISO_DATE_FORMAT} from '@app/config';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import {MTableToolbar} from 'material-table';
import * as moment from 'moment';
import {Link} from 'react-router-dom';
import {reverse} from '@app/urls';
import * as ZoneService from '@app/services/backend/zone';
import {getDateSortNumber} from '@app/services/sorting';
import {trimesters} from '@e700/utils/trimesterSelectItems';
import FormButtonExport from '@e700/utils/FormButtonExport';
import theme from '@e700/theme';


const styles = theme => ({
    root: {
        padding:'10px',
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
    text_form: {
        fontWeight: '300',
        lineHeight: '29px',
        textAlign: 'left',
        marginTop: '30px'
    },
    subtext_form: {
        fontWeight: '400',
        letterSpacing: '0.5px',
        lineHeight: '28px',
        textAlign: 'left',
    },
    select: {
        minWidth: 'auto',
        textAlign: 'center',
        marginLeft: theme.spacing(4),
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(1)
    }
});

export const FormRegistry = withStyles(styles)(class extends SubscribedComponent {

    state = {
        region: '',
        regionOptions: [],
        selectedYear: '',
        trimesters: [],
        selectedTrimester: '',
        instances:[],
        selectedInstances: [],
        checkbox_array: []
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
        const instances = this.props.instances;
        this.setState({checkbox_array: (instances.map(instance => ({id: instance.id, checked: false})))});
    }

    componentDidUpdate(prevProps, prevState) {
        const instances = this.props.instances;
        if (prevProps.instances !== instances) {
            this.setState({checkbox_array: (instances.map(instance => ({id: instance.id, checked: false})))});
        }
    }

    itemPredicate(item, listFilter) {
        switch (listFilter) {
            case 'all':
                return true;
            case 'received':
                return item.state === 'answer_received';
            case 'reviewed-with-comments':
                return (
                    item.state === 'answer_reviewed' &&
                    item.comments.length > 0
                );
            case 'reviewed-no-comments':
                return (
                    item.state === 'answer_reviewed' &&
                    item.comments.length === 0
                );
            case 'generated-cases':
                return false; // TODO define what is a generated case
            case 'not-received':
                return (
                    item.state === 'open' ||
                    item.state === 'new_sending' ||
                    item.state === 'new_sent'
                );
            default:
                return false;
        }
    }

    changeNameState = (filter) => {
        switch (filter) {
            case 'all':
                return 'Todos los Registros de E700';
            case 'received':
                return 'Recibidos';
            case 'reviewed-no-comments':
                return 'Archivados sin observaciones';
            case 'reviewed-with-comments':
                return 'Archivados con observaciones';
            case 'not-received':
                return 'Aún por recibir';
            default:
                break;
        }
    };

    instanceToTableRow(instance) {
        const sent = instance.sent_at ? moment(instance.sent_at).format(ISO_DATE_FORMAT) : 'Pendiente';
        let entity = '--';
        let faena = '--';
        if (instance.work_sites.length > 0) {
            if (instance.work_sites[0].entity) {
                entity = instance.work_sites[0].entity.name;
            }
            faena = instance.work_sites[0].name;
        }
        let buttonDisabled = true, omitted = '--';
        if (instance.state === 'answer_received' || instance.state === 'answer_reviewed') {
            buttonDisabled = false;
            omitted = instance.form_field_count - instance.answer_count;
        }
        return {
            id: instance.id,
            period: instance.period,
            version: instance.version_code,
            workSite: [
                entity, faena
            ],
            id_sngm: instance.target_meta && instance.target_meta.id_sngm ?
                instance.target_meta.id_sngm.value : "--",
            target: instance.target_name,
            button: <Button
                style={{width: '150px', whiteSpace: 'nowrap', color: '#ffffff', backgroundColor: '#1A76D1'}}
                variant="contained"
                disabled={buttonDisabled}
                component={Link} to={reverse('e700.detail', {id: instance.id})}>
                REVISAR
            </Button>,
            omitted,
            sent,
            received: instance.received_at
        };
    }

    getOmittedSortNumber(data1, data2) {
        if (data1 === data2) return 0;
        if (isNaN(data1)) return 1;
        if (isNaN(data2)) return -1;
        return data2 - data1;
    }

    isSearched(data, input) {
        if (input === '') return true;
        return ((data.workSite[0] && data.workSite[0].toLowerCase().search(input.toLowerCase()) >= 0) ||
                (data.workSite[1] && data.workSite[1].toLowerCase().search(input.toLowerCase()) >= 0));
    }

    onInstanceFilter = (newInstance, checked) => {
        let updatedSelectedInstances = [];
        if (checked) {
            updatedSelectedInstances = this.state.selectedInstances.find((instance) => instance === newInstance) ?
                [...this.state.selectedInstances] :
                [...this.state.selectedInstances, newInstance];
        }
        else {
            this.state.selectedInstances.forEach(instance => {
                if (instance !== newInstance) {
                    updatedSelectedInstances.push(instance);
                }
            })
        }
        let updatedCheckbox_array = this.state.checkbox_array.map(row => {
            let new_row = row;
            if (new_row.id === newInstance) {
                new_row.checked = !new_row.checked;
            }
            return new_row;
        });

        this.setState(
            state => ({
                selectedInstances: updatedSelectedInstances,
                checkbox_array: updatedCheckbox_array
            })
        );
    };

    onInstanceAllFilter(checked) {
        const instances = this.props.instances;
        if (checked) {
            let updatedSelectedInstances = [], updatedCheckbox_array = [];
            instances.filter((instance) => {
                return ((this.state.selectedYear === '' || this.state.selectedYear === instance.year) &&
                (this.state.selectedTrimester === '' || this.state.selectedTrimester === instance.trimester));
            }).forEach((instance) => {
                updatedSelectedInstances.push(instance.id);
                updatedCheckbox_array.push({id: instance.id, checked: true});
            });
            this.setState({
                selectedInstances: updatedSelectedInstances,
                checkbox_array: updatedCheckbox_array
            });
        }else{
            this.setState({
                selectedInstances: [],
                checkbox_array: this.state.checkbox_array.map((c) => {c.checked = false; return c})
            });
        }
    };

    uncheckInstances() {
        this.setState({
            selectedInstances: [],
            checkbox_array: this.state.checkbox_array.map((c) => {c.checked = false; return c})
        });
    };

    renderTable(instances) {
        const {loading, classes} = this.props;
        if (loading) {
            return <Typography>cargando...</Typography>;
        } else {
            const tableColumns = [
                {
                    title: <Checkbox checked={this.state.checkbox_array.every(item => item.checked)} onChange={(event) => this.onInstanceAllFilter(event.target.checked)}/>,
                    field: 'id',
                    render:(data) => <Checkbox
                        checked={
                            this.state.checkbox_array.length > 0 &&
                      this.state.checkbox_array.find(c => c.id === data.id).checked}
                        onChange={(event) => event.target && this.onInstanceFilter(data.id, event.target.checked)}/>,
                    sorting: false
                },
                {
                    title: <Typography variant="body2">Periodo</Typography>,
                    field: 'period',
                    searchable: false
                },
                {
                    title: <Typography variant="body2">Versión formulario</Typography>,
                    field: 'version',
                    searchable: false
                },
                {
                    title: <Typography variant="body2">Fecha recepción</Typography>,
                    field: 'received',
                    customSort: (data1, data2) => getDateSortNumber(data1.received, data2.received),
                    render: data => data.received ? moment(data.received).format(ISO_DATE_FORMAT) : 'No recibido aún',
                    searchable: false
                },
                {
                    title: <Typography variant="body2">Empresa/Faena</Typography>,
                    field: 'workSite',
                    customFilterAndSearch: (event, data) => this.isSearched(data, event),
                    render: data => (<Typography>{data.workSite[0]}/{data.workSite[1]}</Typography>),
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
                    title: <Typography variant="body2">Datos omitidos</Typography>,
                    field: 'omitted',
                    customSort: (data1, data2) => this.getOmittedSortNumber(data1.omitted, data2.omitted),
                    searchable: false
                },
                {
                    field: 'button',
                    sorting: false,
                    searchable: false
                }
            ];
            const tableData = instances.filter((instance) => {
                return ((this.state.selectedYear === '' || this.state.selectedYear === instance.year) &&
                    (this.state.selectedTrimester === '' || this.state.selectedTrimester === instance.trimester));
            }).map(this.instanceToTableRow);
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
                                {this.renderFilters()}
                            </Grid>
                            <FormButtonExport
                                instance_ids={this.state.selectedInstances}
                                form_codename='e700'
                                uncheckInstances={() => this.uncheckInstances()}/>
                        </>)
                    }}
                    localization={{body: {emptyDataSourceMessage: 'No se han encontrado registros de E700'},
                        toolbar: {searchPlaceholder: 'Buscar depósito, faena o empresa'}}}
                />
            );
        }
    }

    getYears() {
        let years = new Set([]);
        this.props.instances.forEach((instance) => {
            years.add(instance.year)
        });
        return Array.from(years)
            .slice().sort((a, b) => b - a)
            .map((year) => {return {label: year, value: year};});
    }

    onYearChange(value) {
        let trimesterItems = [];
        if (value !== '') trimesterItems = trimesters;
        this.setState({selectedYear: value,
            selectedTrimester: '',
            trimesters: trimesterItems});
    }

    onTrimestreChange(value) {
        this.setState({selectedTrimester: value});
    }

    renderFilters() {
        const padding = {paddingBottom: '18px', paddingLeft: '20px', paddingRight: '10px'};
        return (<>
            <Grid item style={{...padding, width: 350}}>
                <TSelect
                    field='Región'
                    defaultValue='Todas las regiones'
                    menuItems={this.state.regionOptions}
                    onChange={this.regionFilter()}
                    inputProps={{id: 'region'}}
                    selected={this.state.region}/>
            </Grid>
            <Grid item style={padding}>
                <Grid container spacing={2}>
                    <Grid item style={{width: 100}}>
                        <TSelect
                            field='Año'
                            defaultValue='Todos los años'
                            menuItems={this.getYears()}
                            onChange={(event) => this.onYearChange(event.target.value)}
                            selected={this.state.selectedYear}/>
                    </Grid>
                    <Grid item style={{width: 200}}>
                        <TSelect
                            field='Trimestre'
                            defaultValue='Todos los trimestres'
                            menuItems={this.state.trimesters}
                            disabled={this.state.trimesters.length === 0}
                            onChange={(event) => this.onTrimestreChange(event.target.value)}
                            selected={this.state.selectedTrimester}/>
                    </Grid>
                </Grid>
            </Grid>

        </>
        );
    }

    render() {
        const {classes, instances, listFilter} = this.props;
        return (
            <Grid container className={classes.root}>
                <Grid item xs={12}>
                    <Grid container spacing={1} justify='space-between' alignItems='center'>
                        <Grid item>
                            <Typography variant='h4' className={this.props.classes.text_form}>
                                FORMULARIOS E700
                            </Typography>
                            <Typography variant='h6' className={this.props.classes.subtext_form}>
                                {this.changeNameState(listFilter)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    {this.renderTable(instances.filter(e => this.itemPredicate(e, listFilter)))}
                </Grid>
            </Grid>
        );
    }
});
