import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {COLORS} from '@authorities/theme';
import {MTableToolbar} from 'material-table';
import {Grid, Typography} from '@material-ui/core';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import {IndexStatusIcon} from '@authorities/components/IndexStatusIcon';
import * as Sorting from '@authorities/services/home/sorting';
import AlertSymbology from '@communities/components/target/AlertSymbology';
import {StyledTooltip} from '@communities/components/target/StyledTooltip';

import {history} from '@app/history';
import {reverse} from '@app/urls';

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
    disabled: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0',
        left: '0'
    },
    targetName: {
        fontWeight: 'bold'
    },
    targetWorksite: {
        fontSize: '10px'
    },
    targetState: {
        fontSize: '15px'
    },
    symbology: {
        marginBottom: '10px'
    },
    title: {
        width: '230px',
        paddingTop: '23px'
    },
    zoneName: {
        paddingRight: '10px'
    }
});

/**
 * A component for rendering a table used for monitoring.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class PublicMonitorTable extends Component {
    /**
     * Constructor of the component
     *
     * @param {props} the props.
     * @public
     */
    constructor(props) {
        super(props);
        this.state = {
            itemsShowed: 20,
            currentPage: 0,
            monitoringColumns: []
        };
    }

    /**
     * Function triggered to get a table cell with
     * a deposit name, work and entity.
     *
     * @public
     */
    getNameCell(deposit) {
        const nameStyle = {textAlign: 'left', maxWidth: '100%'};
        const betweenPadding = '2px';
        const {classes} = this.props;
        return (
            <StyledTooltip
                placement="right" arrow
                title={
                    <Grid container direction="column" alignItems="flex-start">
                        <Grid item xs={12}>
                            <Typography
                                variant="body2">{deposit.name} • {deposit.work} • {deposit.entity}</Typography>
                        </Grid>
                    </Grid>
                }>
                <Grid container style={{paddingBottom: betweenPadding}}>
                    <Grid item xs={12} style={nameStyle}>
                        <Typography noWrap className={classes.targetName}>{deposit.name}</Typography>
                    </Grid>
                    <Grid item xs={12} style={nameStyle}>
                        <Typography noWrap className={classes.targetState}>{deposit.state}</Typography>
                    </Grid>
                    <Grid item xs={12} style={nameStyle}>
                        <Typography noWrap className={classes.targetWorksite}>{deposit.work}</Typography>
                    </Grid>
                    <Grid item xs={12} style={nameStyle}>
                        <Typography noWrap className={classes.targetWorksite}>{deposit.entity}</Typography>
                    </Grid>

                </Grid>
            </StyledTooltip>
        );
    }

    componentDidMount() {
        this.setState({
            monitoringColumns: this.getMonitoringColumns()
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
     * Function triggered to get the table columns.
     *
     * @public
     */
    getMonitoringColumns() {
        return [
            {
                title: (<Typography variant="body2">Depósito de relaves</Typography>),
                field: 'deposito',
                render: data => this.getNameCell(data),
                customSort: (data1, data2) => Sorting.getNameSortNumber(data1, data2),
                cellStyle: {width: '25%', paddingLeft: '23px'},
                customFilterAndSearch: (event, data) => this.isSearched(data, event),
                searchable: true,
                headerStyle: {paddingLeft: '23px'}
            },
            {
                title: (<Typography variant="body2">Monitoreo de Índices</Typography>),
                field: 'publicWorstIndex',
                render: data => (<IndexStatusIcon status={data.publicWorstIndex} size="default"/>),
                customSort: (data1, data2) => Sorting.getSortNumber(data2, data1, 'publicWorstIndex'),
                searchable: false
            }
        ];
    }



    getZoneName(type) {
        const {data} = this.props;
        if (data.length > 0 && data[0][type]) {
            return data[0][type].name;
        }
        return '';
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
        const {classes, disabled} = this.props;
        const tableStyle = {
            rowStyle: rowData => ({
                height: '80px',
                backgroundColor: rowData.tableData.checked ? COLORS.secondary.light : ''
            }),
            headerStyle: {
                backgroundColor: COLORS.secondary.dark,
                fontSize: '12px',
                textAlign: 'left'
            },
            pageSize: this.state.itemsShowed,
            initialPage: this.state.currentPage,
            showTitle: false
        };
        
        return (
            <div style={{position: 'relative'}}>
                <TMaterialTable
                    data={this.props.data || []}
                    columns={this.state.monitoringColumns}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    onChangePage={this.handleChangePage}
                    onRowClick={(event, rowData) => {
                        history.push(reverse('public.targets.target', { target: rowData.canonical_name,
                            commune: this.props.commune }));
                    }}
                    options={tableStyle}
                    components={{
                        Toolbar: props => (
                            <Grid container spacing={3} alignItems='center' justify='space-between'>
                                <Grid item xs>
                                    <Grid container justify='flex-start'>
                                        <Grid item xs={12} className={classes.title}>
                                            <Typography variant='h5'>{this.props.title}</Typography>
                                        </Grid>
                                        <Grid item className={classes.zoneName}>
                                            <Typography variant='h5'>{this.props.communeName}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant='h5'>• {this.props.regionName}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <MTableToolbar {...props} classes={{root: classes.toolbar}}/>
                                </Grid>
                                <Grid item className={classes.symbology}>
                                    <AlertSymbology/>
                                </Grid>
                            </Grid>
                        )
                    }}
                    localization={{
                        body: {emptyDataSourceMessage: 'No hay depósitos en esta comuna'}
                    }}
                />
                {disabled && <div className={classes.disabled}/>}
            </div>
        );
    }
}

PublicMonitorTable.propTypes = {
    title: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};

export default withStyles(styles)(PublicMonitorTable);
