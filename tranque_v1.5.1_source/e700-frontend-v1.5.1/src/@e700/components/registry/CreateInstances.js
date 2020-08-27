import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import TSelect from '@app/components/utils/TSelect';
import {MTableToolbar} from 'material-table';
import { Button, CircularProgress, Checkbox, Grid,
    InputLabel, FormControl, FormControlLabel, Select, MenuItem,
    TextField, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import * as config from '@app/config';
import * as moment from 'moment/moment';
import 'moment/locale/es';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TargetService from '@app/services/backend/target';
import * as FormService from '@app/services/backend/form';
import * as ZoneService from '@app/services/backend/zone';
import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import theme from '@e700/theme';
import {reverse} from '@app/urls';
import {Link} from 'react-router-dom';
import history from '@app/history';


const styles = theme => ({
    root:{
        paddingTop: theme.spacing(4),
        paddingLeft: theme.spacing(8),
        paddingRight: theme.spacing(4),
        paddingBottom: theme.spacing(5)
    },
    select: {
        minWidth: '120px',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(2)
    },
    selectTarget: {
        width: '330px',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(2)
    },
    selectYear: {
        width: '150px',
        marginRight: '30px',
    },
    divCheckboxes: {
        display: 'inline',
    },
    cancelButton: {
        float: 'right',
        marginRight: '15px',
        width: '220px',
        whiteSpace: 'nowrap',
        color: '#ffffff',
        backgroundColor: '#1A76D1'
    },
    assignButton: {
        float: 'right',
        width: '220px',
        whiteSpace: 'nowrap',
        color: '#ffffff',
        backgroundColor: '#1A76D1'
    },
    iconDelete: {
        marginRight: theme.spacing(0.5)
    }
});

const CreateInstances = withStyles(styles)(class extends SubscribedComponent {

    state = {
        region: '',
        regionOptions: [],
        natural_key: '',
        trimester: 1,
        year: moment().year(),
        target: '',
        version: '',
        versionOptions: [],
        targetOptions: [],
        downloading: false,
        requesting: false,
        targetType: [],
        checkbox_array: [],
        target_array: [],
        selectedTargets: [],
        deletedTargets: [],
        instancesOk: [],
    };

    constructor(props) {
        super(props);
        moment.locale(config.MOMENT_LOCALE);
    }

    componentDidMount() {
        this.subscribe(
            TargetService.listAll({cache: config.DEFAULT_CACHE_TIME}),
            (targets) => this.setState({
                targetOptions: targets,
                target_array: targets.map(target => ({canonical_name: target.canonical_name, checked: false}))
            })
        );

        this.subscribe(
            FormService.listAllVersions({form_codename: 'e700'}),
            (versions) => this.setState({versionOptions: versions})
        );

        this.subscribe(
            ZoneService.listAll({type: 'region'}),
            regions => {
                this.setState({
                    regionOptions: ZoneService.parseZoneOptions(regions),
                });
            }
        );

        this.subscribe(
            FormService.listTargetType(),
            (types) => this.setState({targetType: types.data.results})
        );


    }

    selectRegion = (regionValue) => {
        const value = regionValue === '' ? '' : regionValue.natural_key;
        this.setState({natural_key: value});
    };

    regionFilter() {
        return (event) => {
            this.setState({region: event.target.value});
            this.selectRegion(event.target.value);
        };
    };

    handleChangeV = event => {
        this.setState({version: event.target.value});
    };

    handleChangeT = event => {
        this.setState({target: event});
    };

    handleTrimesterChange = event => {
        this.setState({trimester: +event.target.value});
    };

    handleYearChange = event => {
        this.setState({year: (event.target.value + '').replace(/\D/g, '')});
    };

    createInstance = (targetsList) => {
        const {trimester, year, version} = this.state;
        let noCreated = 0;
        const totalTargets = targetsList.length;
        const targets = targetsList.map(target =>
            ({trimester, year, version, target_canonical_name: target.canonical_name}));
        this.setState({requesting: true, showError: false});
        this.subscribe(
            FormService.createMassiveInstance({
                form_codename: 'e700',
                targets
            }),
            (newInstance) => {
                let ins = [];
                newInstance.forEach(i => {
                    if (i && i.id){
                        ins.push(i);
                        this.setState({instancesOk: ins});
                    }
                    else {
                        noCreated += 1;
                    }
                })
                if (ins.length === targetsList.length){
                    this.props.actions.openSnackbar('Instancias creadas satisfactoriamente', 'success', null, 6000);
                    this.setState({requesting: false});
                    history.push(reverse(`e700.registry.all`));
                }
                else if (noCreated > 0) {
                    this.props.actions.openSnackbar('No fueron creadas: "' + noCreated+'/'+totalTargets + '" instancias', 'error', null, 6000);
                    this.setState({
                        showError: true,
                        requesting: false
                    });
                }
            },
            response => {
                this.props.actions.openSnackbar('Hubo un error al crear las instancias.', 'error', null, 6000);
                this.setState({ requesting: false });
            });
    };

    isSearched(data, input) {
        if (input === '') return true;
        return ((data.workSite[0] && data.workSite[0].toLowerCase().search(input.toLowerCase()) >= 0) ||
                (data.workSite[1] && data.workSite[1].toLowerCase().search(input.toLowerCase()) >= 0));
    }

    onTargetFilter = (newTarget, checked) => {
        let updatedSelectedTargets = [];
        if (checked) {
            updatedSelectedTargets = this.state.selectedTargets.find((target) => target === newTarget) ?
                [...this.state.selectedTargets] :
                [...this.state.selectedTargets, newTarget];
        }
        else {
            this.state.selectedTargets.forEach(target => {
                if (target !== newTarget) {
                    updatedSelectedTargets.push(target);
                }
            })
        }
        let updatedTarget_array = [];

        if (this.state.target_array.length > 0) {
            updatedTarget_array = this.state.target_array.map(row => {
                let new_row = row;
                if (new_row.canonical_name === newTarget) {
                    new_row.checked = !new_row.checked;
                }
                return new_row;
            });
        }

        this.setState(
            state => ({
                selectedTargets: updatedSelectedTargets,
                target_array: updatedTarget_array
            })
        );
    };

    onTargetAllFilter(checked) {
        const targetOptions = this.state.targetOptions;
        if (checked) {
            let updatedSelectedTargets = [], updatedTarget_array = [];
            targetOptions.forEach((target) => {
                updatedSelectedTargets.push(target.id);
                updatedTarget_array.push({id: target.id, checked: true});
            });
            this.setState({
                selectedTargets: updatedSelectedTargets,
                target_array: updatedTarget_array
            });
        }else{
            this.setState({
                selectedTargets: [],
                target_array: this.state.target_array.map((c) => {c.checked = false; return c})
            });
        }
    };

    handleCheckbox = (id, checked) => {
        const checkbox_array = this.state.checkbox_array;
        let new_checkbox_array;
        if (checkbox_array.some(item => item.id === id)) {
            new_checkbox_array = checkbox_array.map(item => {
                if (item.id === id) item.checked = checked;
                return item;
            });
        }else {
            new_checkbox_array = [...checkbox_array];
            new_checkbox_array.push({id: id, checked: checked});
        }
        this.setState({
            checkbox_array: new_checkbox_array
        });
    };

    targetToTableRow(version, target) {
        let entity = '--';
        let faena = '--';
        if (target.work_sites.length > 0) {
            if (target.work_sites[0].entity) {
                entity = target.work_sites[0].entity.name;
            }
            faena = target.work_sites[0].name;
        }
        return {
            canonical_name: target.canonical_name,
            target: target.name,
            workSite: [
                entity, faena
            ],
            typeTarget: target.type_description,
            version: version,
        };
    }

    renderTargetTable(version, target) {
        const {loading, classes} = this.props;
        const {downloading} = this.state;
        if (loading) {
            return <Typography>cargando...</Typography>;
        } else {
            const tableColumns = [
                {
                    title: '',
                    field: 'id',
                    render:(data) => {
                        return <Checkbox
                            checked={
                                this.state.target_array.length > 0 &&
                      (this.state.target_array.find(c => c.canonical_name === data.canonical_name) || {}).checked}
                            onChange={(event) => event.target && this.onTargetFilter(data.canonical_name, event.target.checked)}/>},
                    sorting: false
                },
                {
                    title: <Typography variant="body2">Depósito</Typography>,
                    field: 'target',
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
                    title: <Typography variant="body2">Tipo de relave</Typography>,
                    field: 'typeTarget',
                    searchable: false
                },
                {
                    title: <Typography variant="body2">Versión formulario</Typography>,
                    field: 'version',
                    searchable: false
                },
            ];
            const tableData = target.map((target) => this.targetToTableRow(version,target));
            return (
                <TMaterialTable
                    data={tableData}
                    columns={tableColumns}
                    options={{searchFieldStyle: {fontSize: 14, width: '300px', paddingTop: '8px'},
                        doubleHorizontalScroll: false,
                        headerStyle: { fontWeight: 'bold',
                            backgroundColor: theme.palette.primary.main,
                            color: '#ffffff'}
                    }}
                    components={{
                        Toolbar: props => (<>
                            <Grid container alignItems='center' spacing={2} justify='space-between' className={classes.toolbarPadding}>
                                <Grid item>
                                    <MTableToolbar {...props} classes={{root: classes.toolbar}}/>
                                </Grid>
                                {this.renderFilters()}
                            </Grid>
                            <Button
                                disabled={downloading}
                                variant="outlined"
                                onClick={() => this.onDeleteSelection()}
                            >
                                {downloading ?
                                    <CircularProgress size={24} className={classes.iconDelete}/> :
                                    <DeleteIcon className={classes.iconDelete}/>
                                }
                              Eliminar Selección
                            </Button>
                        </>)
                    }}
                    localization={{body: {emptyDataSourceMessage: 'No se han seleccionado depósitos'},
                        toolbar: {searchPlaceholder: 'Depósito, faena o empresa'}}}
                />
            );
        }
    }

    onDeleteSelection() {
        const {selectedTargets} = this.state;
        this.setState({deletedTargets: selectedTargets});
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
        </>
        );
    }

    filterTargets = (targetOptions, checkbox_array) => {
        const instancesOk = this.state.instancesOk;
        const natural_key = this.state.natural_key;
        let target = targetOptions.filter(target =>
            target.state === 'activo' &&
        checkbox_array.some(type => type.id === target.type && type.checked));

        if (natural_key !== '') {
            target = target.filter(t => t.zone.natural_key.startsWith(natural_key));
        }

        return target.filter(t => {
            let found = false;
            this.state.deletedTargets.forEach(s => {
                if (s === t.canonical_name) found = true;
            });
            return !found;
        }).filter(t => {
            let foundInstance = false;
            instancesOk.forEach(i => {
                if (i.canonical_name === t.canonical_name) foundInstance = true;
            });
            return !foundInstance;
        });
    };

    render() {
        const {classes} = this.props;
        const {versionOptions, targetOptions,
            year, trimester, version,
            requesting, targetType,
            checkbox_array} = this.state;

        const targetByType = this.filterTargets(targetOptions, checkbox_array);

        const selectedVersion = version && versionOptions.find(v => v.id === version);

        const versions = versionOptions.map((v, index) => (
            <MenuItem key={index} value={v.id}>{v.title}</MenuItem>
        ));

        const disableCreate = !(year && trimester && version && targetByType.length > 0);

        return (
            <>
                <div className={classes.root}>
                    <Typography variant="h5">Asignación de Formulario</Typography>
                    <div>
                        <FormControl variant="outlined" className={classes.select} disabled={requesting}>
                            <InputLabel htmlFor="trimester">Trimestre</InputLabel>
                            <Select
                                value={trimester}
                                onChange={this.handleTrimesterChange}
                                inputProps={{
                                    id: 'trimester'
                                }}>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Año"
                            disabled={requesting}
                            inputProps={{
                                type: 'number',
                                min: 1900,
                                step: 1
                            }}
                            value={year}
                            onChange={this.handleYearChange}
                            margin="normal"
                            variant="outlined"
                            className={classes.selectYear}
                        />
                        <FormControl variant="outlined" className={classes.select} disabled={versions.length < 1 || requesting}>
                            <InputLabel htmlFor="version">Versión</InputLabel>
                            <Select
                                value={version}
                                onChange={this.handleChangeV}
                                inputProps={{
                                    id: 'version'
                                }}>
                                {versions}
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <Typography variant="h6">Tipo de depósito</Typography>
                        {targetType.map((t,i) => {
                            return <div key={i} className={classes.divCheckboxes}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value={t.id}
                                            checked={this.state.checkbox_array.some(item => item.id === t.id && item.checked)}
                                            onChange={(event) => this.handleCheckbox(t.id,event.target.checked)}
                                        />
                                    }
                                    label={t.description}
                                />
                            </div>;
                        })}
                    </div>
                    <div>
                        {this.renderTargetTable(selectedVersion.title, targetByType)}
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            className={classes.assignButton}
                            disabled={disableCreate || requesting}
                            onClick={() => this.createInstance(targetByType)}
                        >
                            <Typography style={{textTransform: 'capitalize'}}>Asignar Formularios</Typography>
                        </Button>
                        <Button
                            className={classes.cancelButton}
                            variant="contained"
                            component={Link} to={reverse('e700.registry.all')}
                        >
                            <Typography style={{textTransform: 'capitalize'}}>Volver al inicio</Typography>
                        </Button>
                    </div>
                </div>

            </>
        );
    }
});


function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(snackbarActions, dispatch) };
}

export default connect(null, mapDispatchToProps)(CreateInstances);
