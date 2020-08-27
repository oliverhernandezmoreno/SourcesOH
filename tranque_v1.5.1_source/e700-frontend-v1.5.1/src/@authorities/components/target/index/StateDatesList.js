import React, {Component} from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {COLORS} from '@authorities/theme';
import moment from 'moment/moment';
import {List, ListItem, Card, CardContent, Typography, FormHelperText} from '@material-ui/core';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {IndexStatusIcon} from '@authorities/components/IndexStatusIcon';


const styles = theme => ({
    card: {
        backgroundColor: theme.palette.secondary.main,
    },
    list: {
        backgroundColor: COLORS.white,
    },
    recentList: {
        backgroundColor: COLORS.white,
        marginBottom: 10,
        padding: 0
    },
    recentItem: {
        height: 52
    },
    title: {
        fontWeight: 'bold',
        padding: 10
    },
    datesGrid: {
        padding: 10,
    },
    date: {
        width: '155px',
        height: '75px'
    },
    input: {
        backgroundColor: COLORS.white
    },
    invalidRange: {
        paddingBottom: '25px'
    }
});





/**
 * A component for rendering a table with recent and previous index states with dates.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class StateDatesList extends Component {
    /**
    * Constructor of the component
    *
    * @param {props} the props.
    * @public
    */
    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endDate: null,
        };
    }


    /**
    * Function triggered to handle DatePicker change for the startDate.
    *
    * @param {date} the new date.
    * @public
    */
    onStartDateChange = (date) => this.setState({startDate: moment(date)});

    /**
    * Function triggered to handle DatePicker change for the endDate.
    *
    * @param {date} the new date.
    * @public
    */
    onEndDateChange = (date) =>  this.setState({endDate: moment(date)});


    /**
    * Function triggered to get the data list with date range filter applied.
    *
    * @param {data} the data for a previous index state.
    * @public
    */
    getDataInRange(data) {
        const {startDate, endDate} = this.state;
        return data.filter((item) => {
            const itemDate = moment(item.date);
            if (!startDate && !endDate) return true;
            else if (!startDate) return itemDate.isSameOrBefore(endDate);
            else if (!endDate) return itemDate.isSameOrAfter(startDate);
            else {
                return (itemDate.isSameOrAfter(startDate) &&
                    itemDate.isSameOrBefore(endDate));
            }
        });
    }

    /**
    * Function triggered to create a list item.
    *
    * @param {data} the data for a list item.
    * @param {index} an index to identify the list item.
    * @public
    */
    getListItem(data, index) {
        if (!data || data.length === 0) return <ListItem key={0}></ListItem>;
        const dateString = (data.date && moment(data.date).format('DD-MM-YYYY HH:mm'));
        const selected = this.props.selected;
        const style = index === 'id_recent' ? {height: 52} : {};
        return (
            <React.Fragment key={index}>
                <ListItem button
                    style={style}
                    selected={moment(data.date).isSame(moment(selected.date)) &&
                              selected.indexValue === data.indexValue}
                    onClick={(event) => this.props.onSelect(data)}>
                    <IconTextGrid icon={<IndexStatusIcon status={data.indexValue}/>}
                        text={
                            <Typography variant='body2'>
                                {dateString}
                            </Typography>}/>
                </ListItem>
            </React.Fragment>
        );
    }


    /**
     * Function triggered to render the list of index state items.
     *
     * @public
     */
    getListItems() {
        const {data, loading} = this.props;
        const dataInRange = this.getDataInRange(data.slice(1, data.length));
        if (dataInRange.length === 0 && !loading)
            return (<ListItem key='no_range'>
                <Typography variant='body2'>No hay datos en este rango</Typography>
            </ListItem>);
        return dataInRange.map((item, index) => this.getListItem(item, index));
    }

    /**
     * Function triggered to render the recent index state.
     *
     * @public
     */
    getRecentItem() {
        const {data, loading} = this.props;
        if (!data[0] && !loading) {
            return (<ListItem key='no_info'>
                <Typography variant='body2'>No hay información disponible</Typography>
            </ListItem>);
        }
        return this.getListItem(data[0], 'id_recent');
    }


    /**
     * Function triggered to render a message when date range is not valid.
     *
     * @public
     */
    getValidateMessage() {
        const {startDate, endDate} = this.state;
        if (startDate && endDate && startDate.isAfter(endDate)) {
            return (<FormHelperText error className={this.props.classes.invalidRange}>
                      El rango no es válido
            </FormHelperText>);
        }
        return '';
    }


    /**
     * Function triggered to get the start date picker value that must be displayed.
     *
     * @public
     */
    getDatePickerStart() {
        if (!this.state.startDate) {
            return this.props.initialStartDate;
        }
        return this.state.startDate;
    }


    /**
     * Function triggered to get the end date picker value that must be displayed.
     *
     * @public
     */
    getDatePickerEnd() {
        if (!this.state.endDate) {
            return this.props.initialEndDate;
        }
        return this.state.endDate;
    }




    /**
     * Render this component.
     *
     * @public
     */
    render() {
        const {classes} = this.props;
        return (
            <Card className={classes.card}>
                <CardContent>
                    <Typography align='left' className={classes.title}>
                        Más reciente
                    </Typography>
                    <List className={classes.recentList}>
                        {this.getRecentItem()}
                    </List>
                    <Typography align='left' className={classes.title}>
                        Anteriores (últimos 50 cálculos)
                    </Typography>
                    <List className={classes.list}>
                        {this.getListItems()}
                    </List>
                </CardContent>
            </Card>
        );
    }
}

StateDatesList.propTypes = {
    data: PropTypes.array.isRequired,
};

export default withStyles(styles)(StateDatesList);
