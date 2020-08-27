import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, Grid, Typography, Button, CircularProgress, withStyles} from '@material-ui/core';
import ListSensor from '@miners/components/EF/dashboard/ListSensor';

const borderColor = '#525252';

const styles = (theme) => ({
    root: {
        backgroundColor: '#161719',
        borderColor: borderColor,
    },
    header: {
        backgroundColor: theme.palette.secondary.main,
        height: 50,
        paddingLeft: '15px',
        paddingRight: '15px',
        borderBottom: `1px solid ${borderColor}`,
    },
    content: {
        minHeight: 40,
        padding: 30
    },
    text__detail: {
        fontSize: 14,
        whiteSpace: 'nowrap',
        textTransform: 'none'
    },
    spinner: {
        color: '#d0d0d0'
    }
});


class CardSensingPoint extends Component {

    render() {
        const {classes, values, goToDetail, title, loading} = this.props;
        const textDetail = 'Ir a sección de datos >';
        return (
            <Card variant="outlined" className={classes.root}>
                <Grid container className={classes.header} justify='space-between' alignItems="center">
                    <Grid item>{(title || '').toUpperCase()}</Grid>
                    <Grid item>
                        <Button
                            disabled={!goToDetail}
                            onClick={goToDetail && goToDetail()}>
                            <Typography className={classes.text__detail}>
                                {textDetail}
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={1} className={classes.content}>
                    { loading ? <CircularProgress className={classes.spinner}/> :
                        (values || []).map((val, index) =>
                            <Grid item key={`sensor-${index}`}>
                                <ListSensor value={val}/>
                            </Grid>
                        )
                    }
                </Grid>
            </Card>
        );
    }
}

CardSensingPoint.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardSensingPoint);
