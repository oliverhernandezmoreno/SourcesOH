import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Switch, Typography, Box } from '@material-ui/core';
import { connect } from 'react-redux';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as EtlService from '@app/services/backend/etl';

const styles = theme => ({
    switchBox: {
        display: 'flex',
        flexDirection: 'column',
        background: '#262629',
        borderRadius: '5px',
        padding: theme.spacing(3),
        border: '1px solid #6d6d6d;',
    },
    switchBoxHeader: {
        fontWeight: 1000,
        marginBottom: '1em'
    },
    switchBoxBody: {
        display: 'grid',
        gridTemplateColumns: '4fr 1fr',
        alignItems: 'start',
        justifyItems: 'end',
        gridRowGap: theme.spacing(1),
    }
});

// const SwitchBox = function ({ header, bodyContent, switchProps }) {
class SwitchBox extends SubscribedComponent {

    constructor(props){
        super(props);
        this.state = {
            currentState: undefined,
            loading: true,
        }
    }

    getCurrentState = () => {
        const target = this.props.switchProps.target
        // Load triggers
        if(this.props.switchProps.canonical_name){
            this.subscribe(
                TimeseriesService.list({
                    target: target,
                    template_name: `ef-mvp.m1.${this.props.switchProps.canonical_name}`,
                }),
                (ts) => {
                    this.setState({
                        loading: false,
                        currentState: ts,
                    })
                }
            )
        }
        else{
            this.setState({
                loading: false,
            })
        }
    }

    defaultOnChange = (value) => {
        this.setState({
            loading: true,
        })
        this.subscribe(
            EtlService.createImmediately({
                target: this.props.switchProps.target,
                executor: "direct",
                context:{
                    events: [
                        {
                            "name": `${this.props.switchProps.target}.none.ef-mvp.m1.${this.props.switchProps.canonical_name}`,
                            "value": value ? 1 : 0,
                        }
                    ]
                }
            }),
            (op) => {
                this.setState({loading: false});
                setTimeout(this.getCurrentState, 1000);
            },
            () => this.setState({
                loading: false,
                isRaining: !value ? 1 : 0,
            })
        );
    }

    componentDidMount() {
        this.getCurrentState();
    }


    render() {
        const { classes } = this.props;
        const checked = this.props.switchProps.checked ?
            this.props.switchProps.checked
            : this.state.currentState === 1;
        const onChange = this.props.switchProps.onChange ? this.props.switchProps.onChange : this.defaultOnChange;
        return (<div className={classes.switchBox}>
            <div className={classes.switchBoxHeader}>
                <Typography component="div" variant="body1" color="textSecondary">
                    <Box fontWeight="fontWeightBold" >
                        {this.props.header}
                    </Box>
                </Typography>
            </div>
            <div className={classes.switchBoxBody}>
                {/* {
                    ['textPrimary', 'textSecondary', 'primary', 'secondary']
                        .flatMap((color) => ['h5','h6','subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline'].map((variant)=>(<Typography variant={variant} color={color}>{variant}-{color}</Typography>)))
                } */}

                <Typography variant="body1" color="textSecondary">
                    {this.props.bodyContent}
                </Typography>

                <Switch {...this.props.switchProps}
                    checked={checked}
                    onChange={onChange}
                    disabled={this.props?.switchProps?.disabled || this.state.loading} />
            </div>

        </div>)
    }
}

const MapStateToProps = state => {
    return {
        serieCanonicalName: state.miners.timeSeries.serie_canonical_name
    };
};

export default connect(MapStateToProps, null)(withStyles(styles)(SwitchBox));
// export default withStyles(styles)(SwitchBox);
