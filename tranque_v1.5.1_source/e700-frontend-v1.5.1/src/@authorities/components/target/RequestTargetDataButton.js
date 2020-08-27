import React, {Component} from 'react';
import * as moment from 'moment/moment';
import {Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, withStyles} from '@material-ui/core';
import {DatePicker} from '@app/components/utils';

const styles = theme => ({
    dateFilter: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(3)
    },
});

/**
 * A component for rendering a button and a dialog for target data requesting.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class RequestTargetDataButton extends Component {

    state = {
        openDialog: false,
        selectedStartDate: moment().subtract(1, 'year').startOf('day'),
        selectedEndDate: moment().endOf('day'),
    };

    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };
    handleCloseDialog = () => {
        this.setState((state) => ({openDialog: false,
            selectedStartDate: state.startDate,
            selectedEndDate: state.endDate}));
    };
    handleRequest = () => {
        this.setState({openDialog: false}, () =>
            this.props.handleRequest(this.state.selectedStartDate, this.state.selectedEndDate));
    }

    onStartDateSelect = date => this.setState({selectedStartDate: date});
    onEndDateSelect = date => this.setState({selectedEndDate: date});

    renderDialog() {
        const {openDialog, selectedEndDate, selectedStartDate} = this.state;
        return (<Dialog open={openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Selección del rango de tiempo de los datos</DialogTitle>
            <DialogContent>
                <DatePicker keyboard className={this.props.classes.dateFilter}
                    label="Desde"
                    maxDate={selectedEndDate || moment().endOf('day')}
                    value={selectedStartDate}
                    onChange={this.onStartDateSelect}
                />
                <DatePicker keyboard className={this.props.classes.dateFilter}
                    label="Hasta"
                    maxDate={moment().endOf('day')}
                    minDate={selectedStartDate || undefined}
                    value={selectedEndDate}
                    onChange={this.onEndDateSelect}
                />
                <DialogContentText>
                    Transmitir los datos desde servidores de la Compañía Minera a SERNAGEOMIN puede tardar algunos minutos.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleRequest} variant='contained' color="primary">
                            Continuar
                </Button>
                <Button onClick={this.handleCloseDialog} variant='contained' color="primary">
                            Cancelar
                </Button>
            </DialogActions>
        </Dialog>);
    }

    /**
    * Render this component.
    *
    * @public
    */
    render() {
        return (<>
            <Button className={this.props.className} variant='contained' color='primary' disableElevation onClick={this.handleOpenDialog}>
                      SOLICITAR DATOS
            </Button>
            {this.renderDialog()}
        </>);
    }
}



export default withStyles(styles)(RequestTargetDataButton);
