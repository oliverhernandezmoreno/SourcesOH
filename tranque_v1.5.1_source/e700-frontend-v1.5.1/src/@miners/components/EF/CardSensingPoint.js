import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import GridListSensor from '@miners/components/EF/GridListSensor';
import history from '@app/history';
import {reverse} from '@app/urls';

const styles = {
    root: {
        width: '100%',
        backgroundColor: '#262629',
        margin: 10
    },

    header: {
        width: '100%',
        height: '20%'
    },

    content: {
        width: '100%',
        minHeight: '150px',
        padding: 5

    },

    footer: {
        width: '100%',
        minHeight: '100px'
    },

    title: {
        width: '90%',
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        position: 'relative'
    },

    contrast__area: {
        padding: 5,
        height: '100%',
        backgroundColor: '#161719'
    },

    without__function: {
        width: '60%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'

    },

    link: {
        width: '40%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
    },

    text__font: {
        fontSize: '1.5vw',
        color: '#ffffff',
        position: 'absolute',
        top: '50%',
        left: '20%',
        transform: 'translate(-50%, -50%)'
    },

    text__title: {
        fontSize: '1.2vw',
        color: '#ffffff',
        textTransform: 'none',
        position: 'absolute',
        top: '50%',
        left: '10%',
        transform: 'translate(-50%, -50%)'
    },

    text__detail: {
        fontSize: '0.8vw',
        color: '#009EFF',
        whiteSpace: 'nowrap',
        textTransform: 'none'
    },

    button__details: {
        position: 'absolute',
        top: '50%',
        left: '70%',
        transform: 'translate(-50%, -50%)'
    },

    loading: {
        color: 'whiteSmoke',
        marginLeft:'110px'
    },

};


class CardSensingPoint extends Component {

    goToDetail() {
        return () => {
            history.push(reverse('miners.target.ef.data.template', {
                target: this.props.target,
                template: this.props.template.split('.').pop()
            }));
        };
    }

    render() {
        const {classes} = this.props;
        const textDetail = 'Ver Detalles';
        return (
            <Card className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.title}>
                        <Typography className={classes.text__title}>
                            {this.props.title}
                        </Typography>
                        {this.props.values === undefined ? this.renderLoading(): null}
                    </div>
                </div>
                <div className={classes.content}>
                    <div className={classes.contrast__area}>
                        <GridListSensor values={this.props.values}/>
                    </div>
                </div>

                <div className={classes.footer}>
                    <div className={classes.without__function}>

                    </div>
                    <div className={classes.link}>
                        <Button
                            className={classes.button__details}
                            disabled={this.props.data}
                            onClick={this.goToDetail(this.props.template)}>
                            <Typography className={classes.text__detail}>
                                {textDetail}
                            </Typography>
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }
}

CardSensingPoint.propTypes = {
    classes: PropTypes.object.isRequired,
    template: PropTypes.string.isRequired
};

export default withStyles(styles)(CardSensingPoint);
