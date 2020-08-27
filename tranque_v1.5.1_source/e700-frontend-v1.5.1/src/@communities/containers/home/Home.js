import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {HttpClient} from '@app/services/httpClient';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {AppBar, Avatar, Grid, Toolbar, Typography} from '@material-ui/core';
import InfoCard from '@communities/components/home/InfoCard';
import TargetSearcherContainer from '@communities/containers/home/TargetSearcherContainer';
import * as config from '@app/config';

const styles = theme => ({
    root: {
        flexGrow: 1,
        background: 'linear-gradient(180deg, #36ADDC 0%, #007FBD 100%)'
    },
    typography: {
        fontFamily: 'Open Sans, sans-serif',
        flexGrow: 1
    },
    section: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        background: 'linear-gradient(0deg, #36ADDC 0%, #007FBD 100%)',
        fontFamily: 'Open Sans, sans-serif',
        height: '100%'
    },
    infoCardContainer: {
        paddingBottom: 100
    }
});

class Home extends SubscribedComponent {
    state = {
        infos: [],
        zoneInfo: []
    };

    componentDidMount() {
        /* Important: This service will probably not continue to be ocuped
          in the new version of the site */
        const url = `${config.API_HOST}/public/info/`;
        this.subscribe(
            HttpClient.get(url),
            obj => this.setState({infos: obj.data.results})
        );
    }

    render() {
        const {classes} = this.props;
        const TITLE = 'Observatorio de relaves';
        return (
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Toolbar variant="dense">
                        <div>
                            <Avatar src={'/assets/logo.jpg'}/>
                        </div>
                        <Typography variant="h6" color="inherit" align="center" className={classes.typography}>
                            <p>{TITLE}</p>
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Grid container>
                    <Grid item xs={12} className={classes.section}>
                        <TargetSearcherContainer/>
                    </Grid>
                </Grid>
                <Grid container className={classes.infoCardContainer}>
                    {this.state.infos.map(d => (
                        <Grid item key={'card-' + d.id} xs={12} sm={12} lg={4}>
                            <InfoCard id={d.id} title={d.title} image={d.image_url} description={d.description}/>
                        </Grid>
                    ))}
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(Home);
