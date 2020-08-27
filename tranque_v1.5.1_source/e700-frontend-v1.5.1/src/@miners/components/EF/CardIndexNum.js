import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import IconStatus from '@miners/components/EF/IconStatus';
import * as actionTypes from '@miners/actions';
import {connect} from 'react-redux';
import NumberFormat from 'react-number-format';
import history from '@app/history';
import {reverse} from '@app/urls';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
    root: {
        width: '100%',
        height: '250px',
        backgroundColor: '#262629',
        margin: 10
    },

    header: {
        width: '100%',
        height: '20%',
        display:"flex",
        alignItems:"center",
    },

    content: {
        width: '100%',
        height: '60%',
        position: 'relative'
    },

    footer: {
        width: '100%',
        height: '20%'
    },

    status: {
        width: '10%',
        margin:"10px",
        height: '10%',
        boxSizing:"inherit",
        position: 'relative'
    },

    title: {
        width: '80%',
        marginTop:"20px",
        height: '30%',

    },

    value: {
        width: '80%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
    },

    index__value: {
        width: '100%',
        height: '80%',
        position: 'relative'
    },

    source__value: {
        width: '100%',
        height: '20%',
        position: 'relative'
    },

    units: {
        width: '20%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
    },

    time: {
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
        fontSize: '1vw',
        color: '#ffffff',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },

    button__details: {
        title: 'Redux_button',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },

    text__title: {
        fontSize: '0.9vw',
        color: '#ffffff',
        position: 'relative',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)'

    },

    text__value_max: {
        fontSize: '3.2vw',
        color: '#ffffff',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'

    },

    text__value_min: {
        fontSize: '1.8vw',
        color: '#ffffff',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'

    },

    text__source: {
        fontSize: '1.5vw',
        color: '#ffffff',
        whiteSpace: 'nowrap',
        position: 'absolute',
        top: '50%',
        left: '40%',
        transform: 'translate(-50%, -50%)'

    },

    text__unit: {
        fontSize: '0.7vw',
        color: '#ffffff',
        textTransform: 'none',
        position: 'absolute',
        top: '40%',
        left: '5%',
        transform: 'translate(-50%, -50%)'

    },

    text__date: {
        fontSize: '0.8vw',
        color: '#ffffff',
        whiteSpace: 'nowrap',
        textTransform: 'none',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },

    text__detail: {
        fontSize: '0.8vw',
        color: '#009EFF',
        whiteSpace: 'nowrap',
        textTransform: 'none',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },

    iconStatus: {
        position: 'relative',
        transform: 'translate(-50%, -50%)',
        top: '50%',
        left: '50%'
    },

    loading: {
        color: 'whiteSmoke',
        marginBottom:'50px',
        marginLeft:'120px'
    },

});

class CardIndexNum extends Component {

    goToDetail() {
        return () => {
            this.props.onSerieCanonicalName(this.props.serie);
            history.push(reverse('miners.target.ef.data.template', {
                target: this.props.target,
                template: this.props.template.split('.').pop()
            }));
        };
    }

    renderLoading = () => {
        const {classes} = this.props;
        return (
            <div>
                <CircularProgress className={classes.loading}/>
            </div>
        );
    };

    render() {
        const {classes} = this.props;
        let FONT_THRESHOLD = 6;
        const textDetail = 'Ver Detalles';

        const changeFontSize = (obj) => {
            if (obj === undefined) {
                return this.renderLoading()
            } else {
                if (obj.length > FONT_THRESHOLD) {
                    return (<Typography className={classes.text__value_min}>
                        <NumberFormat value={parseFloat(obj).toFixed(1)} displayType={'text'} thousandSeparator={false}/>
                    </Typography>);
                } else {
                    return (<Typography className={classes.text__value_max}>
                        <NumberFormat value={parseFloat(obj).toFixed(1)} displayType={'text'} thousandSeparator={false}/>
                    </Typography>);
                }
            }
        };

        return (
            <Card className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.status}>
                        <IconStatus
                            value={this.props.data}
                            threshold={this.props.threshold}/>
                    </div>
                    <div className={classes.title}>
                        <Typography className={classes.text__title}>
                            {this.props.name}
                        </Typography>
                    </div>
                </div>

                <div className={classes.content}>
                    <div className={classes.value}>
                        <div className={classes.index__value}>
                            {changeFontSize(this.props.data)}
                        </div>
                        <div className={classes.source__value}>
                            <Typography className={classes.text__source}>
                                {this.props.source}
                            </Typography>
                        </div>
                    </div>
                    <div className={classes.units}>
                        <Typography className={classes.text__unit}>
                            {this.props.units}
                        </Typography>
                    </div>
                </div>

                <div className={classes.footer}>
                    <div className={classes.time}>
                        <Typography className={classes.text__date}>
                            {this.props.date}
                        </Typography>

                    </div>
                    <div className={classes.link}>
                        <Button
                            className={classes.button__details}
                            disabled={!this.props.data}
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


const MapDispatchToProps = dispatch => {
    return {
        onSerieCanonicalName: (group) => dispatch({
            type: actionTypes.ADD_SERIE_CANONICAL_NAME,
            serie_canonical_name: group
        })
    };
};

CardIndexNum.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(null, MapDispatchToProps)(withStyles(styles)(CardIndexNum));
