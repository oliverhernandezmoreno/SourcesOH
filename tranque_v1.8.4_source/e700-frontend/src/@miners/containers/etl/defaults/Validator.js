import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import UnarchiveOutlinedIcon from '@material-ui/icons/UnarchiveOutlined';

import {history} from '@app/history';
import {reverse} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import EMACETLDataDisplay from '@miners/containers/etl/defaults/DataDisplay';
import * as etlService from '@app/services/backend/etl';

const styles = (theme) => ({
    mainButton: {
        background: '#1a76d1',
    },
    loadingContainer: {
        textAlign: 'center',
        marginLeft: '50px',
    },
    loading: {
        color: 'white',
    },
});

class Validator extends SubscribedComponent {
    state = {
        delivering: false,
        error: null,
        loading: false,
    };

    deliver() {
        const {updateOperation, operation, target} = this.props;
        this.setState({error: null, delivering: true, loading: true});
        this.subscribe(
            etlService.deliver({
                target,
                operation: operation.id,
            }),
            (op) => {
                this.setState({delivering: false});
                updateOperation(op);
            },
            () =>
                this.setState({
                    delivering: false,
                    error: 'Ocurrió un error al cargar los datos',
                })
        );
    }

    renderLoading() {
        const {classes} = this.props;
        return (
            <div className={classes.loadingContainer}>
                <CircularProgress className={classes.loading} />
            </div>
        );
    }

    render() {
        const {classes, target, executor, operation} = this.props;
        return (
            <Card>
                <CardHeader
                    avatar={
                        <Avatar>
                            <UnarchiveOutlinedIcon />
                        </Avatar>
                    }
                    title={this.props.spec.header}
                    titleTypographyProps={{variant: 'h6'}}
                    subheader={this.props.spec.subheader}
                />
                <CardContent>
                    <EMACETLDataDisplay target={this.props.target} operation={this.props.operation} />
                    <Grid container direction="row" justify="space-around">
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() =>
                                    history.push(
                                        reverse(this.props.spec.loaderRoute, {
                                            target,
                                            executor,
                                        })
                                    )
                                }
                            >
                                <ChevronLeft />
                                Comenzar nueva carga
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                className={classes.mainButton}
                                fullWidth
                                disabled={!operation.deliverable || this.state.delivering}
                                onClick={this.deliver.bind(this)}
                                size="large"
                            >
                                Cargar datos
                                <ChevronRight />
                            </Button>
                        </Grid>
                        {this.state.delivering && this.state.loading && this.renderLoading()}
                    </Grid>
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(Validator);
