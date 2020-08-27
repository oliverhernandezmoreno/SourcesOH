import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Button, Grid, Typography} from '@material-ui/core';
import TSelect from '@app/components/utils/TSelect';
import * as ZoneService from '@app/services/backend/zone';
import {MTableToolbar} from 'material-table';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as config from '@app/config';
import moment from 'moment';
import * as FormService from '@app/services/backend/form';
import {bindActionCreators} from 'redux';
import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {connect} from 'react-redux';
import {CREATED, REJECTED, ACCEPTED} from '@e700/constants/reportFormStates';
import theme from '@e700/theme';

const styles = theme => ({
    root: {
        padding: '50px',
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

class NewRequest extends SubscribedComponent {

    state = {
        region: '',
        regionOptions: [],
        loading: false,
        requests: []
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
        });
    }

    getRequests(instances) {
        const requests = instances
            .filter(i => i.form_requests.length > 0 && i.form_requests[0].state === CREATED)
            .map(i => ({
                request: i.form_requests[0],
                instance: i,
                period: i.period,
                created_at: moment(i.form_requests[0].created_at).format(config.DATE_FORMAT),
                target: i.target_name,
                comment: i.form_requests[0].comment
            }));
        this.setState({requests});
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
        this.getRequests(this.props.instances);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.instances !== this.props.instances) {
            this.getRequests(this.props.instances);
        }
    }

    updateState(request, instance, state) {
        return () => {
            this.setState({loading: true});
            this.subscribe(
                FormService.updateRequest({
                    form_codename: 'e700',
                    instance_id: instance.id,
                    id: request.id,
                    state
                }),
                request => {
                    if (this.props.onRequestUpdate) {
                        this.props.onRequestUpdate(instance.id, request);
                    }
                },
                undefined,
                () => {
                    let msg = '';
                    if (state === ACCEPTED) {
                        msg = 'Solicitud aprobada.';
                    }
                    if (state === REJECTED) {
                        msg = 'Solicitud rechazada.';
                    }
                    this.props.actions.openSnackbar(msg, 'success', null, 6000);
                    this.setState({loading: false});
                }
            );
        };
    }

    renderFilters() {
        return (
            <Grid item style={{paddingBottom: 16, minWidth: 350}}>
                <TSelect
                    field='Región'
                    disabled={this.state.loading}
                    defaultValue='Todas las regiones'
                    menuItems={this.getFormattedRegions()}
                    onChange={this.regionFilter()}
                    inputProps={{id: 'region'}}
                    selected={this.state.region}/>
            </Grid>
        );
    }

    renderTable() {
        const {loading, classes} = this.props;
        if (loading) {
            return <Typography>cargando...</Typography>;
        } else {
            const tableColumns = [
                {
                    title: <Typography variant="body2">Período</Typography>,
                    field: 'period',
                    searchable: false
                },
                {
                    title: <Typography variant="body2">Enviado por la empresa</Typography>,
                    field: 'created_at',
                    searchable: false
                },
                {
                    title: <Typography variant="body2">Depósito</Typography>,
                    field: 'target',
                    sorting: false
                },
                {
                    title: <Typography variant="body2">Motivo solicitud</Typography>,
                    field: 'comment',
                    sorting: false
                },
                {
                    field: 'accept',
                    sorting: false,
                    render: data => (
                        <Button
                            disabled={this.state.loading}
                            style={{color: '#ffffff', backgroundColor: '#1A76D1'}}
                            variant="contained"
                            onClick={this.updateState(data.request, data.instance, 'accepted')}
                        >Aprobar</Button>
                    ),
                    searchable: false
                },
                {
                    field: 'reject',
                    sorting: false,
                    render: data => (
                        <Button
                            disabled={this.state.loading}
                            style={{color: '#ffffff', backgroundColor: '#1A76D1'}}
                            variant="contained"
                            onClick={this.updateState(data.request, data.instance, 'rejected')}
                        >Rechazar</Button>
                    ),
                    searchable: false
                }
            ];

            return (
                <TMaterialTable
                    data={this.state.requests}
                    columns={tableColumns}
                    options={{
                        headerStyle: { fontWeight: 'bold',
                            backgroundColor: theme.palette.primary.main,
                            color: '#ffffff'}
                    }}
                    components={{
                        Toolbar: props => (<>
                            <Grid
                                container alignItems='center' spacing={2} justify='space-between'
                                className={classes.toolbarPadding}>
                                <Grid item xs={12} sm={12} md={4}>
                                    <MTableToolbar {...props} classes={{root: classes.toolbar}}/>
                                </Grid>
                                {this.renderFilters()}
                            </Grid>
                        </>)
                    }}
                    localization={{body: {emptyDataSourceMessage: 'No existen solicitudes de reasignación de formulario'}}}
                />
            );
        }
    }

    render() {
        const {classes, cases, name} = this.props;
        return (
            <Grid container spacing={1} className={classes.root}>
                <Grid item x={12} className={classes.card1}>
                    <Typography variant='h4' className={classes.text_form}>
                        FORMULARIOS E700 > SOLICITUDES
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

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators(snackbarActions, dispatch)};
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(NewRequest));
