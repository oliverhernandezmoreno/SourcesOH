import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import EventIcon from '@material-ui/icons/Event';
import SimpleTable from '@miners/components/SimpleTable';

const cardStyles = {
    card: {
        backgroundColor: '#303030',
        margin: 5
    },

    cardHeader: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: '10px'
    },

    icon: {
        color: '#ffffff',
        margin: '10px'
    }
};

/**
 * This class is label with a calendar.
 *
 * @param {props} the input properties
 * @public
 */
const FrequencyCard = (props) => {
    const {classes} = props;
    return (
        <Card className={classes.card}>
            <CardContent>
                <div style={{display: 'flex'}}>
                    <EventIcon className={classes.icon}/>
                    <Typography className={classes.cardHeader}>{props.title}</Typography>
                </div>
                {(props.dataGroups || []).map(
                    (group, i) => <SimpleTable key={`table-${i}`} data={group.data} header={group.header}/>
                )}
            </CardContent>
        </Card>
    );
};

FrequencyCard.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    dataGroups: PropTypes.arrayOf(PropTypes.shape({
        data: PropTypes.array,
        header: PropTypes.array
    }))
};

export default withStyles(cardStyles)(FrequencyCard);
