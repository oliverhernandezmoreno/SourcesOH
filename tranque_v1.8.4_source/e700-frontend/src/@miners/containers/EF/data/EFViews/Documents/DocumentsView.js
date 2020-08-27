import React from 'react';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import AboutParameter from '../DefaultTemporalView/AboutParameter'
import Typography from '@material-ui/core/Typography';
import { getEFLabel } from '@miners/components/EF/EF.labels';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import DocumentList from './DocumentList';
import SwitchesList from '../SwitchesList';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030'
    },
    container: {
        backgroundColor: '#303030',
        paddingTop: '0.5em',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        margin: '30px',
        marginBottom: '0px'
    },
    title: {
        height: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
    },
    content: {
        width: '100%',
        position: 'relative',
    },
    bottomContent: {
        width: '100%',
        position: 'relative',
        padding: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
    },
    button: {
        whiteSpace: 'pre',
        color: '#01aff4',
        border: '1px solid #01aff4',
        '&:disabled': {
            backgroundColor: '#424242',
        }
    },
});


class DocumentsView extends SubscribedComponent {

    state = {
        isLoading: true,
        siteParameters: {}
    };

    getSiteParameters() {
        this.subscribe(
            SiteParameterService.get({v1: true}),
            data => {
                this.setState({siteParameters: data});
            }
        );
    }

    componentDidMount() {
        this.getSiteParameters();
    }

    render() {
        const { classes, wikiLink } = this.props;
        const [documentSection, ...switchesSections] = this.props.sections;
        return (
            <div>
                <Card className={classes.root}>
                    <div className={classes.header}>
                        <div className={classes.title}>
                            <span>
                                <Typography variant='h4'>
                                    Documentación
                                </Typography>
                                <Typography variant='h5'>
                                    {getEFLabel(documentSection.label)}
                                </Typography>
                            </span>
                            <AboutParameter description={this.state.description} wikiLink={this.state.siteParameters[wikiLink]}></AboutParameter>
                        </div>
                    </div>

                    
                    <div className={classes.bottomContent}>
                        <div>
                            <Paper className={classes.root}>
                                <Card className={classes.container}>
                                    <DocumentList disableActions={this.props.disableActions} section={documentSection}></DocumentList>
                                </Card>
                            </Paper>
                        </div>
                        <div>
                            <SwitchesList
                                sections={switchesSections}
                                target={this.props.target}
                                glossaryTicketsLink={this.state.siteParameters['glossary.tickets']}
                                disableActions={this.props.disableActions}
                            ></SwitchesList>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}

const MapStateToProps = state => {
    return {
        serieCanonicalName: state.miners.timeSeries.serie_canonical_name
    };
};

DocumentsView.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(DocumentsView));
