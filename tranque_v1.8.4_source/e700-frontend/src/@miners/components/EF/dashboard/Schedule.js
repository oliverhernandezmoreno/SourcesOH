import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Card, CircularProgress, Grid, Typography} from '@material-ui/core';
import AbstractSchedule from '@miners/containers/EF/dashboard/AbstractSchedule';

const styles = (theme) => {
    const borderColor = '#525252'; //'#4a535e';
    const headerColor = theme.palette.secondary.main; //'#31363c';
    const bodyColor = theme.palette.secondary.dark; //'#262629';
    const textColor = '#d0d0d0';
    const item = {
        paddingLeft: '15px',
        paddingRight: '15px',
        paddingTop: '10px',
        paddingBottom: '10px',
        borderBottom: `1px solid ${borderColor}`,
    };
    const itemText = {
        fontSize: '1.05rem',
        color: textColor,
    };
    return {
        root: {
            backgroundColor: bodyColor,
            marginBottom: '20px',
            border: `1px solid ${borderColor}`,
        },
        header: {
            ...item,
            backgroundColor: headerColor,
        },
        headerText: {
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: textColor,
        },
        item,
        itemText,
        clickableItem: {
            ...item,
            cursor: 'pointer',
        },
        spinner: {
            color: textColor,
        },
        disabledValue: {
            ...itemText,
            color: '#8e8e8e',
        },
        pendingValue: {
            ...itemText,
            color: '#ffff3f',
        },
        upToDateValue: {
            ...itemText,
        },
    };
};

class Schedule extends React.Component {
    renderScheduledValue(rowIndex) {
        const {classes} = this.props;
        if (this.props.rowData === null) {
            return <CircularProgress size="1.05rem" className={classes.spinner} />;
        }
        const timeseries = Object.values((this.props.rowData ?? [])[rowIndex] ?? {}).flat();
        const value = AbstractSchedule.worstFrequency(timeseries);
        const chosenClass = {
            [AbstractSchedule.styles.DISABLED]: classes.disabledValue,
            [AbstractSchedule.styles.PENDING]: classes.pendingValue,
            [AbstractSchedule.styles.UP_TO_DATE]: classes.upToDateValue,
        }[value.style];
        return (
            <Typography className={chosenClass} noWrap>
                {value.value}
            </Typography>
        );
    }

    onItemClick = (index) => () => {
        if (this.props.openRowDialog) {
            this.props.openRowDialog(index);
        }
    };

    render() {
        const {classes} = this.props;
        return (
            <Card variant="outlined" className={classes.root}>
                <Grid
                    container
                    justify="space-between"
                    alignItems="center"
                    spacing={1}
                    className={classes.header}
                >
                    <Grid item>
                        <Typography className={classes.headerText} noWrap>
                            {this.props.title}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography className={classes.headerText} noWrap>
                            Próximo ingreso
                        </Typography>
                    </Grid>
                </Grid>
                {(this.props.rows ?? []).map(({label}, index) => (
                    <Grid
                        key={`schedule-item-${index}`}
                        container
                        justify="space-between"
                        alignItems="center"
                        spacing={1}
                        className={this.props.openRowDialog ? classes.clickableItem : classes.item}
                        onClick={this.onItemClick(index)}
                    >
                        <Grid item style={{width: '70%'}}>
                            <Typography className={classes.itemText} noWrap>
                                {label}
                            </Typography>
                        </Grid>
                        <Grid item>{this.renderScheduledValue(index)}</Grid>
                    </Grid>
                ))}
            </Card>
        );
    }
}

export default withStyles(styles)(Schedule);
