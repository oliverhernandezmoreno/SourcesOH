import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {IconButton, LinearProgress} from '@material-ui/core';
import {PauseCircleFilled, PlayCircleFilled} from '@material-ui/icons';

const step = 100 / (20 / 0.1);
const barColor = '#8E8E8E';

const styles = theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        width: '100%'
    },
    progressTransition: {
        transition: 'transform .15s linear'
    },
    colorPrimary: {
        backgroundColor: '#424242'
    },
    barColorPrimary: {
        backgroundColor: barColor
    },
    progress: {
        marginLeft: '-2px',
        flexGrow: 1
    },
    button: {
        padding: 0,
        color: barColor
    }
});


class DataSourcesProgress_ extends Component {

    state = {
        value: 0
    };

    componentDidMount() {
        this.timer = setInterval(this.progressTick, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    progressTick = () => {
        const {value} = this.state;
        if (value + step >= 100) {
            this.props.onComplete();
            clearInterval(this.timer);
        } else if (!this.props.disabled && !this.props.pauseProgress) {
            this.setState({value: value + step});
        }
    };

    render() {
        const {classes, onClick, disabled, pauseProgress} = this.props;
        const {value} = this.state;
        return (
            <div className={classes.root}>
                <IconButton onClick={onClick} disabled={disabled} className={classes.button}>
                    {!pauseProgress && <PauseCircleFilled/>}
                    {pauseProgress && <PlayCircleFilled/>}
                </IconButton>
                <LinearProgress
                    className={classes.progress}
                    variant='determinate' value={value}
                    classes={{
                        colorPrimary: classes.colorPrimary,
                        barColorPrimary: classes.barColorPrimary,
                        bar1Determinate: classes.progressTransition
                    }}
                />
            </div>
        );
    }
}

export const DataSourcesProgress = withStyles(styles)(DataSourcesProgress_);

DataSourcesProgress.propTypes = {
    onComplete: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    pauseProgress: PropTypes.bool
};
