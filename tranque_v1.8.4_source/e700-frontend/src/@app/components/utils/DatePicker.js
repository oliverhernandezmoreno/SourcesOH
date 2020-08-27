import * as config from '@app/config';
import moment from 'moment';
import {DatePicker as MuiDatePicker, KeyboardDatePicker, MuiPickersUtilsProvider, KeyboardTimePicker} from '@material-ui/pickers';
import React from 'react';
import {withStyles} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import classNames from 'classnames';

const styles = theme => ({
    datePicker: {
        width: theme.spacing(18)
    },
    pickerLabel: {
        color: 'white'
    }
});

/**
 * This class is a data custom data picker or calendar. It permits to select
 * some date in the calendar
 *
 * @param {props} the input properties
 * @public
 */
function CustomDatePicker(props) {
    const {timeOnly, ...customProps} = props;
    const pickerProps = {
        margin: 'none',
        autoOk: true,
        label: 'Seleccione Fecha',
        format: config.DATE_FORMAT,
        initialFocusedDate: moment(),
        invalidDateMessage: 'Formato Invalido',
        maxDateMessage: 'Fecha Invalida',
        minDateMessage: 'Fecha Invalida',
        cancelLabel: <span className={customProps.classes.pickerLabel}>Cancelar</span>,
        okLabel: <span className={customProps.classes.pickerLabel}>OK</span>,
        ...{...customProps, classes: {...customProps.classes, datePicker: undefined, pickerLabel: undefined}},
        className: classNames(customProps.classes.datePicker, customProps.className),
        keyboard: undefined
    };
    let picker;
    if (timeOnly){
        picker = <KeyboardTimePicker {...pickerProps} />;
    }
    else if (props.keyboard) {
        picker = <KeyboardDatePicker {...pickerProps} />;
    } else {
        picker = <MuiDatePicker {...pickerProps} />;
    }
    return <MuiPickersUtilsProvider utils={MomentUtils} locale={config.MOMENT_LOCALE}>
        {picker}
    </MuiPickersUtilsProvider>;
}

export const DatePicker = withStyles(styles)(CustomDatePicker);

export default DatePicker;
