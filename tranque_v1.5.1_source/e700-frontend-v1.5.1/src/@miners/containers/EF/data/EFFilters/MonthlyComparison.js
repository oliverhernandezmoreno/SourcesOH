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
        marginRight: '1em',
        width: '200px',
        '& > div': {
            width: theme.spacing(22)
        }
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

    const setDateOne = (date) => {
        setFilters({
            ...filters,
            dateOne: date
        })
    }
    
    const setDateTwo = (date) => {
        setFilters({
            ...filters,
            dateTwo: date
        })
    }

    return (
        <div className={classes.filters}>
            <div className={classes.filter}>
                <DatePicker
                    views={["year", "month"]}
                    label="Mes a graficar (fecha 1)"
                    format="MMMM YYYY"
                    maxDate={filters.dateOne}
                    value={filters.dateOne}
                    onChange={setDateOne}
                />
            </div>

            <div className={classes.filter}>
                <DatePicker
                    views={["year", "month"]}
                    label="Mes a graficar (fecha 2)"
                    format="MMMM YYYY"
                    maxDate={filters.dateTwo}
                    value={filters.dateTwo}
                    onChange={setDateTwo}
                />
            </div>
        </div>
    );
}

export default withStyles( styles )( comp );