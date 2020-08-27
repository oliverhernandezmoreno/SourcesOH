import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';
import {Card, CardContent, Typography} from '@material-ui/core';

const styles = theme => ({
    card: {
        backgroundColor: theme.palette.secondary.main,
    },
    title: {
        textAlign: 'left',
        padding: 10
    },
    text: {
        paddingBottom: 20,
        whiteSpace: 'pre-line'
    }
});

/**
 * A component for rendering detail for a specific index state in time.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class IndexDateDetail extends Component {

    /**
  * Function triggered to get a label with text in a row.
  *
  * @param {label} the label field.
  * @param {text} the text.
  * @public
  */
    getLabelAndText(label, text) {
        const {classes} = this.props;
        return (
            <>
                <Typography variant='body2' align='left'>
                    {label}
                </Typography>
                <Typography variant='body1' align='left'  className={classes.text}>
                    {text || text !== '' ? text : 'No hay información disponible'}
                </Typography>
            </>
        );
    }

    /**
   * Render this component.
   *
   * @public
   */
    render() {
        const {classes} = this.props;
        const dateString = (this.props.date && moment(this.props.date).format('DD-MM-YYYY HH:mm'));
        return (
            <>
                <Typography variant='h5' className={classes.title}>
                  Detalle del índice según fecha de cálculo
                </Typography>
                <Card className={classes.card}>
                    <CardContent>
                        {this.getLabelAndText('Fecha de cálculo', dateString)}
                        {this.getLabelAndText('Descripción del estado del índice', this.props.stateDescription)}
                    </CardContent>
                </Card>
            </>
        );
    }
}


IndexDateDetail.propTypes = {
    date: PropTypes.any,
    stateDescription: PropTypes.string
};

export default withStyles(styles)(IndexDateDetail);
