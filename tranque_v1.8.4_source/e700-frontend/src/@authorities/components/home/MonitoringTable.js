import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {withStyles} from '@material-ui/core/styles';
import {COLORS} from '@authorities/theme';
import {MTableToolbar} from 'material-table';
import {Box, Grid, Link, Tooltip, Typography} from '@material-ui/core';
import {Help, Visibility} from '@material-ui/icons';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import TSwitch from '@app/components/utils/TSwitch';
import TSelect from '@app/components/utils/TSelect';
import TSymbology from '@authorities/components/TSymbology';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import {IndexStatusIcon} from '@authorities/components/IndexStatusIcon';
import {RemoteStatusIcon} from '@authorities/components/RemoteStatusIcon';
import * as Sorting from '@authorities/services/home/sorting';
import {NOT_IN_SMC} from '@authorities/constants/connectionState';
import {NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR} from '@authorities/constants/alerts';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import TicketTypeIcon from '@alerts_events/components/icons/TicketTypeIcon';
import { A, B, C, D } from '@alerts_events/constants/ticketGroups';
import ProfileTabs from '@authorities/components/ProfileTabs';

import {homeFiltersActions} from '@authorities/actions/homeFilters.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


const states = [
    {label: 'Activo', value: 'activo'},
    {label: 'Inactivo', value: 'inactivo'},
    {label: 'Abandonado', value: 'abandonado'}
];

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

const styles = theme => ({
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
    glossary: {
        marginLeft: 10,
        marginRight: 0,
        width: 10
    },
    filters: {
        marginBottom: theme.spacing(2),
        paddingLeft: 20,
        padding: 10
    },
    selectGroup: {
        paddingBottom: 20
    },
    searchContainer: {
        paddingBottom: 5
    },
    disabled: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0',
        left: '0'
    }
});

const StyledTooltip = withStyles({
    tooltip: {maxWidth: 'none', backgroundColor: COLORS.secondary.light, color: COLORS.black},
    arrow: {color: COLORS.secondary.light}
})(Tooltip);

/**
 * A component for rendering a table used for monitoring.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class MonitoringTable extends Component {
    /**
     * Constructor of the component
     *
     * @param {props} the props.
     * @public
     */
    constructor(props) {
        super(props);
        this.state = {
            filteredData: [],
            itemsShowed: 20,
            currentPage: 0,
            regionProvinces: this.getProvinces(),
            provinceCommunes: this.getCommunes(),
            monitoringColumns: [],
            regions: props.regions,
            glossaryLink: null,
        };
    }

    // HANDLING GLOBAL FILTER STATE
    getCommunes() {
        const provinces = this.getZoneChildren(this.getStoredRegion(), this.props.regions, 'provinces');
        return this.getZoneChildren(this.getStoredProvince(), provinces, 'communes') || [];
    }
    getProvinces() {
        return this.getZoneChildren(this.getStoredRegion(), this.props.regions, 'provinces');
    }
    getCurrentRegionItem() {
        return this.props.regions.find(r => r.value.natural_key === this.props.storedSelectedRegion);
    }
    getCurrentProvinceItem(regionItem) {
        return regionItem.provinces.find(p => p.value.natural_key === this.props.storedSelectedProvince.natural_key);
    }
    getStoredRegion() {
        const regionItem = this.getCurrentRegionItem();
        return regionItem ? regionItem.value : '';
    }
    getStoredProvince() {
        const regionItem = this.getCurrentRegionItem();
        if (!regionItem) return '';
        const provinceItem = this.getCurrentProvinceItem(regionItem);
        return provinceItem ? provinceItem.value : '';
    }
    getStoredCommune() {
        const regionItem = this.getCurrentRegionItem();
        if (!regionItem) return '';
        const provinceItem = this.getCurrentProvinceItem(regionItem);
        if (!provinceItem) return '';
        const commune = provinceItem.communes.find(c => c.value.natural_key === this.props.storedSelectedCommune.natural_key);
        return commune ? commune.value : '';
    }

    /**
     * Function triggered to get the number of connected deposits
     * (CONNECTED & FAILED)
     *
     * @public
     */
    getNumberOfConnected() {
        return this.props.data.reduce((acc, item) => item.conexion !== NOT_IN_SMC ? acc + 1 : acc, 0);
    }

    /**
     * Function triggered to get a table cell with
     * a deposit name, work, state, entity and region.
     *
     * @public
     */
    getNameCell(deposit) {
        const align = {textAlign: 'left'};
        const nameStyle = {maxWidth: '50%'};
        const dotStyle = {padding: '0 8px'};
        const betweenPadding = '2px';
        return (
            <StyledTooltip
                placement="right" arrow
                title={ <Grid container direction="column" alignItems="flex-start">
                    <Grid item xs={12}>
                        <Typography variant="body2">{deposit.name} • {deposit.work} • {deposit.entity}</Typography>
                    </Grid>
                </Grid>}>
                <div>
                    <Grid container style={{paddingBottom: betweenPadding}}>
                        <Grid item style={nameStyle}>
                            <Typography noWrap variant="subtitle2">{deposit.name}</Typography>
                        </Grid>
                        <Grid item style={dotStyle}>•</Grid>
                        <Grid item style={nameStyle}>
                            <Typography noWrap variant="subtitle2">{deposit.work}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container style={{paddingTop: betweenPadding}}>
                        <Grid item style={nameStyle}>
                            <Typography noWrap variant="body2">{deposit.state}</Typography>
                        </Grid>
                        <Grid item style={dotStyle}>•</Grid>
                        <Grid item style={nameStyle}>
                            <Typography noWrap variant="body2">{deposit.entity}</Typography>
                        </Grid>
                        <Grid item style={dotStyle}>•</Grid>
                        <Grid item style={{...align, maxWidth: '30%'}}>
                            <Typography noWrap variant="body2">{deposit.region.name}</Typography>
                        </Grid>
                    </Grid>
                </div>
            </StyledTooltip>
        );
    }

    componentDidMount() {
        this.updateFilteredData();
    }


    /**
     * Function triggered to get the table columns.
     *
     * @public
     */
    getMonitoringColumns() {
        const {availability, storedSelectedProfileMonitoringTable} = this.props;
        const a = availability || {};
        const titleStyle = {marginLeft: 26};
        const profile = storedSelectedProfileMonitoringTable || EF_CANONICAL_NAME;
        const ticketsFields = {
            [EF_CANONICAL_NAME]: ['ticketsEFCountA', 'ticketsEFCountB', 'ticketsEFCountC', 'ticketsEFCountD'],
            [EMAC_CANONICAL_NAME]: ['ticketsEMACCountA', 'ticketsEMACCountB', 'ticketsEMACCountC', 'ticketsEMACCountD']
        };
        const alertColorFields = {
            [EF_CANONICAL_NAME]: 'alertColorEF',
            [EMAC_CANONICAL_NAME]: 'alertColorEMAC'
        };

        const disconnectedAlertFields = {
            [EF_CANONICAL_NAME]: 'disconnectedAlertEF',
            [EMAC_CANONICAL_NAME]: 'disconnectedAlertEMAC'
        };
        return [
            {
                title: (<Typography variant="subtitle2">Depósito</Typography>),
                field: 'deposito',
                render: data => this.getNameCell(data),
                customSort: (data1, data2) => Sorting.getNameSortNumber(data1, data2),
                cellStyle: {width: '32%', paddingLeft: '23px'},
                customFilterAndSearch: (event, data) => this.isSearched(data, event),
                searchable: true,
                headerStyle: {paddingLeft: '23px'}
            },
            {
                title: (
                    <Typography variant="subtitle2" align="center" style={titleStyle}>
                        Semáforo<br/>Comunidad
                    </Typography>
                ),
                field: alertColorFields[profile],
                render: data => (
                    <AlertStatusIcon
                        color={data[alertColorFields[profile]]}
                        size="default"
                        disconnected={data[disconnectedAlertFields[profile]]} />
                ),
                headerStyle: {textAlign: 'center'},
                cellStyle: {textAlign: 'center'}
            },
            {
                title: (
                    <Typography variant="subtitle2" align="center" style={titleStyle}>
                        <TicketTypeIcon group={A} evaluable twoRows/>
                    </Typography>
                ),
                field: ticketsFields[profile][0],
                render: data => (
                    <Typography variant="subtitle2" align="center">
                        {data[ticketsFields[profile][0]]}
                    </Typography>
                ),
                searchable: false,
                headerStyle: {textAlign: 'center'}
            },
            {
                title: (
                    <Typography variant="subtitle2" align="center" style={titleStyle}>
                        <TicketTypeIcon group={B} evaluable twoRows/>
                    </Typography>
                ),
                field: ticketsFields[profile][1],
                render: data => (
                    <Typography variant="subtitle2" align="center">
                        {data[ticketsFields[profile][1]]}
                    </Typography>
                ),
                searchable: false,
                headerStyle: {textAlign: 'center'}
            },
            {
                title: (
                    <Typography variant="subtitle2" align="center" style={titleStyle}>
                        <TicketTypeIcon group={C} evaluable twoRows/>
                    </Typography>
                ),
                field: ticketsFields[profile][2],
                render: data => (
                    <Typography variant="subtitle2" align="center">
                        {data[ticketsFields[profile][2]]}
                    </Typography>
                ),
                searchable: false,
                headerStyle: {textAlign: 'center'}
            },
            {
                title: (
                    <Typography variant="subtitle2" align="center" style={titleStyle}>
                        <TicketTypeIcon group={D} evaluable twoRows/>
                    </Typography>
                ),
                field: ticketsFields[profile][3],
                render: data => (
                    <Typography variant="subtitle2" align="center">
                        {data[ticketsFields[profile][3]]}
                    </Typography>),
                searchable: false,
                headerStyle: {textAlign: 'center'}
            },
            profile === EF_CANONICAL_NAME && (a.efPublico === undefined || a.efPublico) ? {
                title: (<IconTextGrid
                    justify="flex-start" icon={<Visibility/>}
                    text={<Typography variant="body2" align="center" style={titleStyle}>
                        Estabilidad física (Público)
                    </Typography>}/>),
                field: 'efPublico',
                render: data => (<IndexStatusIcon status={data.efPublico} size="default"/>),
                customSort: (data1, data2) => Sorting.getSortNumber(data2, data1, 'efPublico'),
                searchable: false,
                cellStyle: {textAlign: 'center'}
            } : null,
            profile === EF_CANONICAL_NAME && (a.efInterno === undefined || a.efInterno) ? {
                title: (<Typography variant="body2" align="center" style={titleStyle}>
                            Estabilidad física (Interno)
                </Typography>),
                field: 'efInterno',
                render: data => (<IndexStatusIcon status={data.efInterno} size="default"/>),
                customSort: (data1, data2) => Sorting.getSortNumber(data2, data1, 'efInterno'),
                searchable: false,
                cellStyle: {textAlign: 'center'}
            } : null,
            profile === EMAC_CANONICAL_NAME && (a.indiceRiesgoEstandar === undefined || a.indiceRiesgoEstandar) ? {
                title: (
                    <Typography variant="body2" align="center" style={titleStyle}>
                        IR<br/>(estándar)
                    </Typography>
                ),
                field: 'indiceRiesgoEstandar',
                render: data => (<IndexStatusIcon status={data.indiceRiesgoEstandar} size="default"/>),
                customSort: (data1, data2) => Sorting.getSortNumber(data2, data1, 'indiceRiesgoEstandar'),
                searchable: false,
                cellStyle: {textAlign: 'center'}
            } : null,
            profile === EMAC_CANONICAL_NAME && (a.indiceRiesgo === undefined || a.indiceRiesgo) ? {
                title: (
                    <Typography variant="body2" align="center" style={titleStyle}>
                        IR<br/>(RCA)
                    </Typography>
                ),
                field: 'indiceRiesgo',
                render: data => (<IndexStatusIcon status={data.indiceRiesgo} size="default"/>),
                customSort: (data1, data2) => Sorting.getSortNumber(data2, data1, 'indiceRiesgo'),
                searchable: false,
                cellStyle: {textAlign: 'center'}
            } : null,
            profile === EMAC_CANONICAL_NAME && (a.indiceImpacto === undefined || a.indiceImpacto) ? {
                title: (
                    <Typography variant="body2" align="center" style={titleStyle}>
                        II
                    </Typography>
                ),
                field: 'indiceImpacto',
                render: data => (<IndexStatusIcon status={data.indiceImpacto} size="default"/>),
                customSort: (data1, data2) => Sorting.getSortNumber(data2, data1, 'indiceImpacto'),
                searchable: false,
                cellStyle: {textAlign: 'center'}
            } : null,
            profile === EMAC_CANONICAL_NAME && (a.monitoreoRemoto === undefined || a.monitoreoRemoto) ? {
                title: (
                    <Typography variant="body2">
                        Monitoreo remoto
                    </Typography>
                ),
                field: 'monitoreoRemoto',
                render: data => (<IndexStatusIcon status={data.monitoreoRemoto} size="default"/>),
                customSort: (data1, data2) => Sorting.getSortNumber(data2, data1, 'monitoreoRemoto'),
                searchable: false
            } : null,
            {
                title: (
                    <Typography variant="subtitle2" align="center" style={titleStyle}>
                        Conexión SML
                    </Typography>
                ),
                field: 'conexion',
                render: data => (<div style={{position: 'relative', textAlign: 'center'}}>
                    <RemoteStatusIcon status={data.conexion} size="default"/>
                </div>),
                customSort: (data1, data2) => Sorting.getSortNumber(data1, data2, 'conexion'),
                searchable: false,
                headerStyle: {textAlign: 'center'},
                cellStyle: {textAlign: 'center'}
            }
        ].filter(i => i !== null);
    }


    renderFilters() {
        const {classes, disabled, actions, storedSelectedState} = this.props;
        const {regions, regionProvinces, provinceCommunes} = this.state;
        return (
            <Box alignItems="flex-end">
                <Grid container spacing={2} className={classes.selectGroup}>
                    <Grid item style={{minWidth: 300}}>
                        <TSelect
                            disabled={disabled}
                            field='Región'
                            defaultValue='Todas las regiones'
                            menuItems={regions}
                            onChange={(event) => this.handleRegionChange(event.target.value)}
                            selected={this.getStoredRegion()}/>
                    </Grid>
                    <Grid item style={{minWidth: 250}}>
                        <TSelect
                            disabled={regionProvinces.length === 0 || disabled}
                            field='Provincia'
                            defaultValue='Todas las provincias'
                            menuItems={regionProvinces}
                            onChange={(event) => this.handleProvinceChange(event.target.value)}
                            selected={this.getStoredProvince()}/>
                    </Grid>
                    <Grid item style={{minWidth: 250}}>
                        <TSelect
                            disabled={provinceCommunes.length === 0 || disabled}
                            field='Comuna'
                            defaultValue='Todas las comunas'
                            menuItems={provinceCommunes}
                            onChange={(event) => this.handleCommuneChange(event.target.value)}
                            selected={this.getStoredCommune()}/>
                    </Grid>
                    <Grid item style={{minWidth: 200}}>
                        <TSelect
                            disabled={disabled}
                            field='Estado operacional'
                            defaultValue='Todos los estados'
                            menuItems={states}
                            onChange={(event) => actions.setTargetState(event.target.value)}
                            selected={storedSelectedState}/>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    renderSwitchFilters(){
        const {availability, storedSelectedProfileMonitoringTable, disabled, actions,
            storedNoAlertSwitch, storedYellowAlertSwitch, storedEmacIndexIReSwitch,
            storedRedAlertSwitch, storedEmacIndexIRrSwitch, storedEmacIndexIISwitch,
            noConnectionSwitch, storedDisconnectedAlertSwitch, storedConectionSwitch} = this.props;
        const a = availability || {};
        const profile = storedSelectedProfileMonitoringTable || EF_CANONICAL_NAME;

        const showEFIndexFilters = profile === EF_CANONICAL_NAME && (
            (a.efInterno === undefined || a.efInterno) ||
            (a.efPublico === undefined || a.efPublico)
        );

        const showEMACIndexFilters = profile === EMAC_CANONICAL_NAME && (
            (a.indiceRiesgoEstandar === undefined || a.indiceRiesgoEstandar) ||
            (a.indiceRiesgo === undefined || a.indiceRiesgo) ||
            (a.indiceImpacto === undefined || a.indiceImpacto)
        );

        return (
            <Box alignItems="flex-end">
                <Grid container spacing={1}>
                    <Grid item>
                        <Box display ="flex" alignItems="center" css={{ height: 60 }}>
                            <Typography variant="subtitle2">Ver Semáforos: </Typography>
                        </Box>
                    </Grid>
                    <Grid item>
                        <TSwitch
                            disabled={disabled}
                            label={'Verdes'}
                            onChange={(event) => actions.setNoAlertSwitch(event.target.checked)}
                            checked={storedNoAlertSwitch}/>
                    </Grid>
                    <Grid item>
                        <TSwitch
                            disabled={disabled}
                            label={'Amarillos'}
                            onChange={(event) => actions.setYellowAlertSwitch(event.target.checked)}
                            checked={storedYellowAlertSwitch}/>
                    </Grid>
                    <Grid item>
                        <TSwitch
                            disabled={disabled}
                            label={'Rojos'}
                            onChange={(event) => actions.setRedAlertSwitch(event.target.checked)}
                            checked={storedRedAlertSwitch}/>
                    </Grid>
                    <Grid item>
                        <TSwitch
                            disabled={disabled}
                            label={'Desconectados del sitio público'}
                            onChange={(event) => actions.setDisconnectedAlertSwitch(event.target.checked)}
                            checked={storedDisconnectedAlertSwitch}/>
                    </Grid>
                </Grid>
                {showEFIndexFilters || showEMACIndexFilters ?
                    (<Grid container spacing={1}>
                        <Grid item>
                            <Box display ="flex" alignItems="center" css={{ height: 60 }}>
                                <Typography variant="subtitle2">Ver sólo índices afectados: </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <TSwitch
                                disabled={disabled}
                                label={'IR (Estándar)'}
                                onChange={(event) => actions.setEmacIndexIReSwitch(event.target.checked)}
                                checked={storedEmacIndexIReSwitch}/>
                        </Grid>
                        <Grid item>
                            <TSwitch
                                disabled={disabled}
                                label={'IR (RCA)'}
                                onChange={(event) => actions.setEmacIndexIRrSwitch(event.target.checked)}
                                checked={storedEmacIndexIRrSwitch}/>
                        </Grid>
                        <Grid item>
                            <TSwitch
                                disabled={disabled}
                                label={'II'}
                                onChange={(event) => actions.setEmacIndexIISwitch(event.target.checked)}
                                checked={storedEmacIndexIISwitch}/>
                        </Grid>
                    </Grid>)
                    : null}
                <Grid container spacing={1}>
                    <Grid item>
                        <Box display ="flex" alignItems="center" css={{ height: 60 }}>
                            <Typography variant="subtitle2">Ver depósitos: </Typography>
                        </Box>
                    </Grid>
                    <Grid item>
                        {noConnectionSwitch ? '' : (
                            <TSwitch
                                disabled={disabled}
                                label={'Conectados a SML (' + this.getNumberOfConnected() + ')'}
                                onChange={(event) => actions.setConnectionSwitch(event.target.checked)}
                                checked={storedConectionSwitch}/>)}
                    </Grid>
                </Grid>
            </Box>
        );
    }

    handleCommuneChange(eventValue) {
        this.props.actions.setCommune(eventValue);
    }

    handleProvinceChange(eventValue) {
        this.props.actions.setProvince(eventValue);
        this.props.actions.setCommune('');
        this.setState({
            provinceCommunes: this.getZoneChildren(eventValue, this.state.regionProvinces, 'communes')
        });
    }

    handleRegionChange(eventValue) {
        this.props.actions.setRegion(eventValue.natural_key);
        this.props.actions.setProvince('');
        this.props.actions.setCommune('');
        this.setState({
            regionProvinces: this.getZoneChildren(eventValue, this.state.regions, 'provinces'),
            provinceCommunes: []
        });
    }

    getZoneChildren(parentValue, parentItems, childType) {
        const parentItem = parentItems.find((item) => item.label === parentValue.name);
        return parentItem ? parentItem[childType] : [];
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props) {
            this.setState({
                regions: this.props.regions,
                regionProvinces: this.getZoneChildren(this.getStoredRegion(), this.props.regions, 'provinces'),
                provinceCommunes: this.getCommunes(),
                glossaryLink: this.props.siteParameters?.['GLOSSARY_LINK']
            }, () => this.updateFilteredData());
        }
    }

    /**
     * Function triggered to get the table data with filters applied.
     *
     * @public
     */
    updateFilteredData() {
        const {storedSelectedState, storedNoAlertSwitch, storedYellowAlertSwitch,
            storedRedAlertSwitch, storedDisconnectedAlertSwitch, storedEmacIndexIReSwitch,
            storedEmacIndexIRrSwitch, storedEmacIndexIISwitch, storedConectionSwitch} = this.props;
        const profile = this.props.storedSelectedProfileMonitoringTable || EF_CANONICAL_NAME;

        const alertColorFields = {
            [EF_CANONICAL_NAME]: 'alertColorEF',
            [EMAC_CANONICAL_NAME]: 'alertColorEMAC'
        };

        this.setState({
            monitoringColumns: this.getMonitoringColumns(),
            filteredData: this.props.data.filter(
                item => {
                    return (
                        // Select filters
                        (storedSelectedState === '' || item.state.toLowerCase() === storedSelectedState.toLowerCase()) &&
                        (this.getStoredRegion() === '' || item.region.key === this.getStoredRegion().natural_key) &&
                        (this.getStoredProvince() === '' || item.province.key === this.getStoredProvince().natural_key) &&
                        (this.getStoredCommune() === '' || item.commune.key === this.getStoredCommune().natural_key) &&

                        // Switch filters
                        (
                            (storedNoAlertSwitch && item[alertColorFields[profile]] === NO_ALERT_COLOR) ||
                            (storedYellowAlertSwitch && item[alertColorFields[profile]] === YELLOW_ALERT_COLOR) ||
                            (storedRedAlertSwitch && item[alertColorFields[profile]] === RED_ALERT_COLOR) ||
                            (storedDisconnectedAlertSwitch && item[alertColorFields[profile]] === DISCONNECTED_ALERT_COLOR)
                        ) &&
                        (profile !== EMAC_CANONICAL_NAME || !storedEmacIndexIReSwitch || item.indiceRiesgoEstandar > 0) &&
                        (profile !== EMAC_CANONICAL_NAME || !storedEmacIndexIRrSwitch || item.indiceRiesgo > 0) &&
                        (profile !== EMAC_CANONICAL_NAME || !storedEmacIndexIISwitch || item.indiceImpacto > 0) &&
                        (!storedConectionSwitch || item.conexion !== NOT_IN_SMC)
                    );
                }
            )
        });
    }


    /**
     * Function triggered to decide if a row is going to be in the table after a search event.
     *
     * @param {deposit} the data for a deposit.
     * @param {input} the event value from the search component (current string inside the text field).
     * @public
     */
    isSearched(deposit, input) {
        if (input === '') return true;
        return ((deposit.name && deposit.name.toLowerCase().search(input.toLowerCase()) >= 0) ||
            (deposit.work && deposit.work.toLowerCase().search(input.toLowerCase()) >= 0) ||
            (deposit.entity && deposit.entity.toLowerCase().search(input.toLowerCase()) >= 0));
    }


    /**
     * Function triggered to handle change for "rows per page" option.
     *
     * @param {pageSize} the new page size.
     * @public
     */
    handleChangeRowsPerPage = (pageSize) => {
        this.setState({itemsShowed: pageSize});
    };


    /**
     * Function triggered to handle page changes.
     *
     * @param {page} the new page number (first page = 0).
     * @public
     */
    handleChangePage = (page) => {
        this.setState({currentPage: page});
    };


    /**
     * Render this component.
     *
     * @public
     */
    render() {
        const {classes, disabled, actions, storedSelectedProfileMonitoringTable} = this.props;
        const {glossaryLink} = this.state;
        const tableStyle = {
            rowStyle: rowData => ({
                height: '80px',
                backgroundColor: rowData.tableData.checked ? COLORS.secondary.light : ''
            }),
            headerStyle: {
                backgroundColor: COLORS.primary.main,
                fontSize: '12px',
                textAlign: 'left'
            },
            pageSize: this.state.itemsShowed,
            showTitle: false,
            initialPage: this.state.currentPage,
            searchFieldStyle: {fontSize: 14, width: 350}
        };

        return (
            <div style={{position: 'relative'}}>
                <TMaterialTable
                    data={this.state.filteredData}
                    columns={this.state.monitoringColumns}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    onChangePage={this.handleChangePage}
                    onRowClick={(event, rowData) => {
                        history.push(reverse('authorities.target.semaphores', {target: rowData.canonical_name}));
                    }}
                    options={tableStyle}
                    components={{
                        Toolbar: props => (<>
                            <Grid container alignItems='flex-end' justify='space-between'
                                className={classes.searchContainer}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant='h5' style={{margin: 16}}>
                                        Monitoreo Nacional
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Grid container justify='flex-end'>
                                        <Grid item style={{paddingRight: '50px'}}>
                                            <TSymbology/>
                                        </Grid>
                                        <Grid item>
                                            <Link target="_blank" color="textPrimary" href={glossaryLink}>
                                                <IconTextGrid
                                                    icon={<Help fontSize='small'/>}
                                                    text={<Typography variant='body2'>
                                                        Glosario de términos
                                                    </Typography>}
                                                />
                                            </Link>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <ProfileTabs
                                handleChange={(e, v) => actions.setProfileMonitoringTable(v)}
                                tabValue={storedSelectedProfileMonitoringTable}
                            />
                            <Box className={this.props.classes.filters}>
                                <Grid container alignItems='center' className={classes.searchContainer}>
                                    <Grid item xs={12} lg={3}>
                                        <MTableToolbar {...props} classes={{root: classes.toolbar}}/>
                                    </Grid>
                                    <Grid item xs={12} lg={9}>
                                        {this.renderFilters()}
                                    </Grid>
                                    <Grid item xs={12}>
                                        {this.renderSwitchFilters()}
                                    </Grid>
                                </Grid>
                            </Box>
                        </>)
                    }}
                    localization={{
                        body: {emptyDataSourceMessage: 'No hay depósitos que mostrar'},
                        toolbar: {searchPlaceholder: 'Buscar depósito, faena o empresa'}
                    }}
                />
                {disabled && <div className={classes.disabled}/>}
            </div>
        );
    }
}

MonitoringTable.propTypes = {
    data: PropTypes.array.isRequired,
    disabled: PropTypes.bool
};

const mapStateToProps = state => {
    return {
        storedSelectedProfileMonitoringTable: state.authorities.aut_home_selected_profile_monitoring_table,

        storedSelectedRegion: state.authorities.aut_home_selected_region ,
        storedSelectedProvince: state.authorities.aut_home_selected_province,
        storedSelectedCommune: state.authorities.aut_home_selected_commune,
        storedSelectedState: state.authorities.aut_home_selected_state,

        storedNoAlertSwitch: state.authorities.aut_home_no_alert_switch,
        storedYellowAlertSwitch: state.authorities.aut_home_yellow_alert_switch,
        storedRedAlertSwitch: state.authorities.aut_home_red_alert_switch,
        storedDisconnectedAlertSwitch: state.authorities.aut_home_disconnected_alert_switch,

        storedEmacIndexIReSwitch: state.authorities.aut_home_emac_index_ire_switch,
        storedEmacIndexIRrSwitch: state.authorities.aut_home_emac_index_irr_switch,
        storedEmacIndexIISwitch: state.authorities.aut_home_emac_index_ii_switch,

        storedDataFrequencySwitch: state.authorities.aut_home_data_frequency_switch,
        storedConectionSwitch: state.authorities.aut_home_conection_switch
    };
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(homeFiltersActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MonitoringTable));