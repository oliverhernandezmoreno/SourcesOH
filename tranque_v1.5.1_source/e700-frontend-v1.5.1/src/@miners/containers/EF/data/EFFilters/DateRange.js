import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DatePicker from '@app/components/utils/DatePicker.js';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030',
    },
    filter: {
        color: 'red',
        marginRight: '1em'
    },
    filters: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: '1em',
    },
});

const comp = (props) => {
    const {classes, filters, setFilters} = props;

    const setStartDate = (date) => {
        setFilters({
            ...filters,
            startDate: date
        })
    }
    
    const setEndDate = (date) => {
        setFilters({
            ...filters,
            endDate: date
        })
    }

    return (
        <div className={classes.filters}>
            <div className={classes.filter}>
                <DatePicker
                    label="Desde"
                    value={filters.startDate}
                    onChange={setStartDate}
                    keyboard
                    format='DD.MM.YYYY'
                    maxDate={filters.endDate}
                />
            </div>

            <div className={classes.filter}>
                <DatePicker
                    label="Hasta"
                    value={filters.endDate}
                    onChange={setEndDate}
                    keyboard
                    format='DD.MM.YYYY'
                    minDate={filters.startDate}
                />
            </div>
        </div>
    );
}

export default withStyles( styles )( comp );