import React from 'react';
import {bindActionCreators} from 'redux';
import {menuActions} from '@miners/actions';
import {connect} from 'react-redux';
import {Typography, withStyles} from '@material-ui/core';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as config from '@app/config';
import {HttpClient} from '@app/services';
import {map} from 'rxjs/operators';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import {WorkSiteCard} from '@miners/components/home/WorkSiteCard';

const styles = theme => ({
    root: {
        color: 'white',
        padding: theme.spacing(3)
    },
    content: {
        marginTop: '30px'
    }
});

class Home extends SubscribedComponent {
    state = {
        entities: [],
        loading: true
    };

    componentDidMount() {
        this.props.actions.menuUpdate([]);
        this.setState({loading: true});

        const url = `${config.API_HOST}/v1/user/me/`;
        this.subscribe(
            HttpClient.get(url).pipe(map(res => res.data)),
            data => {
                const entities = data.entities.map(e => ({
                    ...e,
                    work_sites: e.work_sites.map(ws => ({
                        ...ws,
                        targets: ws.targets.map(t => data.targets.find(target => target.canonical_name === t))
                    }))
                }));
                this.setState({entities, loading: false});
            }
        );
    }

    render() {
        const {classes, auth: {user}} = this.props;
        let entity = {name: '', work_sites: []};
        if (this.state.entities.length > 0) {
            entity = this.state.entities[0];
        }
        return (
            <Box display="flex" flexDirection="column" className={classes.root}>
                <Box>
                    <Typography variant="h5" gutterBottom>Plataforma Tranque • {entity.name}</Typography>
                </Box>
                <Box flexGrow={1} className={classes.content}>
                    {this.state.loading ?
                        <CircularProgress/> :
                        this.state.entities.map(entity =>
                            entity.work_sites.map(
                                (ws, index) => (
                                    <WorkSiteCard user={user} key={index} workSite={ws}/>
                                )
                            ))
                    }
                </Box>
            </Box>
        );
    }
}

function mapStateToProps(state) {
    return {
        auth: state.auth
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(menuActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Home));
