import React, {Component} from 'react';
import {Link, IconButton, Grid,
    Dialog, DialogTitle, DialogContent,
    withStyles} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import * as moment from 'moment/moment';
import * as config from '@app/config';
import {getTranslatedState} from '@app/services/backend/dumpRequest';


const styles = theme => ({
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
    },
    dialogContent: {
        paddingBottom: 20
    }
});

/**
 * A component for rendering a link and a dialog for data requests record.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class RequestsRecord extends Component {

    state = {
        openDialog: false
    };

    handleOpenDialog = () => { this.setState({openDialog: true}); };
    handleCloseDialog = () => { this.setState((state) => ({openDialog: false})); };


    renderTable() {
        const columns = [
            {title: 'Fecha de solicitud', field: 'request_date'},
            {title: 'Estado', field: 'state'},
            {title: 'Desde', field: 'start_date'},
            {title: 'Hasta', field: 'end_date'},
        ];
        return (<TMaterialTable
            data={this.formatData()}
            columns={columns}
            options={{paging: false, toolbar: false, sorting: false}}
            localization={{ body: {emptyDataSourceMessage: 'No hay solicitudes registradas'} }}
        />);
    }

    formatData() {
        return this.props.data.map((item) => ({
            request_date: moment(item.created_at).format(config.DATE_FORMAT),
            start_date: moment(item.date_from).format(config.DATE_FORMAT),
            end_date: moment(item.date_to).format(config.DATE_FORMAT),
            state: getTranslatedState(item.state)
        }) );
    }

    renderDialog() {
        const {classes} = this.props;
        const {openDialog} = this.state;
        return (
            <Dialog fullWidth open={openDialog} onClose={this.handleCloseDialog}>
                <DialogTitle>
                    <Grid container>
                        <Grid item> Historial de solicitudes y ventanas de datos </Grid>
                        <Grid item> <IconButton className={classes.closeButton} onClick={this.handleCloseDialog}>
                            <CloseIcon />
                        </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>

                <DialogContent className={classes.dialogContent}>
                    {this.renderTable()}
                </DialogContent>
            </Dialog>
        );
    }

    /**
    * Render this component.
    *
    * @public
    */
    render() {
        return (<>
            <Link variant='body2' color="textPrimary" onClick={this.handleOpenDialog}>
                Ver historial de solicitudes
            </Link>
            {this.renderDialog()}
        </>);
    }
}



export default withStyles(styles)(RequestsRecord);
