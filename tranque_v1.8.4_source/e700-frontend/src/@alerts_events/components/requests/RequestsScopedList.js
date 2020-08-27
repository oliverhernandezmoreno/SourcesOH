import React, {Component} from 'react';
import {Typography, Box, Grid, CircularProgress, withStyles} from '@material-ui/core';
import RequestListCard from '@alerts_events/components/requests/RequestListCard';
import UserFilter from './UserFilter';
import {connect} from 'react-redux';
import {userFilterChecksActions} from '@alerts_events/actions/userFilterChecks.actionCreators';
import {bindActionCreators} from 'redux';
import { PENDING_RECEIVED_EF_CHECKS, RESOLVED_RECEIVED_EF_CHECKS_PETITIONER,
    RESOLVED_RECEIVED_EF_CHECKS_AUTHORIZER, RESOLVED_REQUESTED_EF_CHECKS,
    PENDING_RECEIVED_EMAC_CHECKS, RESOLVED_RECEIVED_EMAC_CHECKS_PETITIONER,
    RESOLVED_RECEIVED_EMAC_CHECKS_AUTHORIZER, RESOLVED_REQUESTED_EMAC_CHECKS,
    PENDING_RECEIVED_CHECKS, RESOLVED_RECEIVED_CHECKS_PETITIONER,
    RESOLVED_RECEIVED_CHECKS_AUTHORIZER, RESOLVED_REQUESTED_CHECKS, varNames }
    from '@alerts_events/actions/userFilterChecks.actionTypes';


const styles = theme => ({
    filters: {
        paddingBottom: 10
    }
});

const PETITIONER = 'solicitante';
const AUTHORIZER = 'autorizador';

const EF = 'ef';
const EMAC = 'emac';

/**
 * A component for rendering a ticket requests list with a specific scope.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class RequestsScopedList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            petitioners: [],
            authorizers: [],
        };
        this.setUsers = this.setUsers.bind(this);
        this.onUserFilterApply = this.onUserFilterApply.bind(this);
        this.initializeCheckboxes = this.initializeCheckboxes.bind(this);
    }

    componentDidMount() {
        this.setUsers();
    }

    componentDidUpdate(prev) {
        if (prev.requests !== this.props.requests) {
            this.setUsers();
        }
    }

    getStoredVariable(filter) {
        const {type, scope} = this.props;
        switch(filter) {
            case PETITIONER:
                switch(type) {
                    case 'pendingReceived':
                        switch(scope) {
                            case EF: return PENDING_RECEIVED_EF_CHECKS;
                            case EMAC: return PENDING_RECEIVED_EMAC_CHECKS;
                            default: return PENDING_RECEIVED_CHECKS
                        }
                    case 'resolvedReceived':
                        switch(scope) {
                            case EF: return RESOLVED_RECEIVED_EF_CHECKS_PETITIONER;
                            case EMAC: return RESOLVED_RECEIVED_EMAC_CHECKS_PETITIONER;
                            default: return RESOLVED_RECEIVED_CHECKS_PETITIONER
                        }
                    default: return null;
                }
            case AUTHORIZER:
                switch(type) {
                    case 'resolvedReceived':
                        switch(scope) {
                            case EF: return RESOLVED_RECEIVED_EF_CHECKS_AUTHORIZER
                            case EMAC: return RESOLVED_RECEIVED_EMAC_CHECKS_AUTHORIZER
                            default: return RESOLVED_RECEIVED_CHECKS_AUTHORIZER
                        }
                    case 'resolvedRequested':
                        switch(scope) {
                            case EF: return RESOLVED_REQUESTED_EF_CHECKS
                            case EMAC: return RESOLVED_REQUESTED_EMAC_CHECKS
                            default: return RESOLVED_REQUESTED_CHECKS
                        }
                    default: return null;
                }
            default: return null;
        }
    }

    getUserType() {
        const {type} = this.props;
        if (type.endsWith('Received')) return AUTHORIZER;
        else if (type.endsWith('Requested')) return PETITIONER;
        else return null;
    }

    setUsers() {
        const {user, requests} = this.props;
        let petitioners = [];
        let authorizers = [];
        const userType = this.getUserType();
        if (userType === PETITIONER) {
            petitioners.push(user)
        }
        else if (userType === AUTHORIZER) {
            authorizers.push(user);
        }
        requests.forEach(req => {
            if (!petitioners.find(u => u.id === req.created_by.id)) {
                petitioners.push(req.created_by);
            }
            if (req.resolved_by && !authorizers.find(u => u.id === req.resolved_by.id)) {
                authorizers.push(req.resolved_by);
            }
        });
        this.setState({petitioners, authorizers}, () => this.initializeCheckboxes())
    }

    initializeCheckboxes() {
        const {petitioners, authorizers} = this.state;
        const {actions} = this.props;
        let initialPetitionerChecks = {}
        let initialAuthorizerChecks = {}
        const storedPetitionerVariable = this.getStoredVariable(PETITIONER);
        const storedAuthorizerVariable = this.getStoredVariable(AUTHORIZER);
        const storedPetitionerChecks = this.props[storedPetitionerVariable] || {};
        const storedAuthorizerChecks = this.props[storedAuthorizerVariable] || {};
        petitioners.forEach(u => {
            initialPetitionerChecks[u.id] = true;
        });
        authorizers.forEach(u => {
            initialAuthorizerChecks[u.id] = true;
        });
        if (!storedPetitionerChecks || !this.haveSameUsers(initialPetitionerChecks, storedPetitionerChecks)) {
            actions.saveUserFilterChecks(initialPetitionerChecks, storedPetitionerVariable);
        }
        if (!storedAuthorizerChecks || !this.haveSameUsers(initialAuthorizerChecks, storedAuthorizerChecks)) {
            actions.saveUserFilterChecks(initialAuthorizerChecks, storedAuthorizerVariable);
        }
    }

    haveSameUsers(checks1, checks2) {
        return JSON.stringify(Object.keys(checks1).sort()) ===
            JSON.stringify(Object.keys(checks2).sort());
    }

    onUserFilterApply(checks, filterType) {
        const {actions} = this.props;
        switch (filterType) {
            case PETITIONER:
                actions.saveUserFilterChecks(checks, this.getStoredVariable(PETITIONER));
                break;
            case AUTHORIZER:
                actions.saveUserFilterChecks(checks, this.getStoredVariable(AUTHORIZER));
                break;
            default: return null;
        }
    }

    getUsers(filter) {
        const {petitioners, authorizers} = this.state;
        let users;
        switch(filter) {
            case PETITIONER:
                users = petitioners;
                break;
            case AUTHORIZER:
                users = authorizers;
                break;
            default:
                users = [];
        }
        return users;
    }

    renderUserFilters() {
        const {userFilters, user, classes} = this.props;
        return <Grid container spacing={1} className={classes.filters}>
            {userFilters.map((userFilter, index) => {
                const users = this.getUsers(userFilter);
                const buttonText = 'FILTRAR POR ' + userFilter.toUpperCase();
                const storedChecks = this.getStoredChecks(userFilter);
                const userFilterProps = {checks: storedChecks, users, user, buttonText, userFilter};
                return <Grid item key={'user-filter-' + index}>
                    <UserFilter
                        onUserFilterApply={(c, f) => this.onUserFilterApply(c, f)}
                        {...userFilterProps}
                    />
                </Grid>
            })}
        </Grid>;
    }

    getStoredChecks(filter) {
        switch(filter) {
            case PETITIONER:
                return this.props[this.getStoredVariable(PETITIONER)];
            case AUTHORIZER:
                return this.props[this.getStoredVariable(AUTHORIZER)];
            default: return {}
        }
    }

    getFilteredRequests() {
        const {userFilters, requests} = this.props;
        const storedPetitionerChecks = this.getStoredChecks(PETITIONER) || {};
        const storedAuthorizerChecks = this.getStoredChecks(AUTHORIZER) || {};
        return requests.filter(req=>{
            const petitionerCheck = storedPetitionerChecks[req.created_by.id];
            const authorizerCheck = req.resolved_by ? (storedAuthorizerChecks[req.resolved_by.id] || false) : false;
            return (userFilters.includes(PETITIONER) ? petitionerCheck : true) &&
                (userFilters.includes(AUTHORIZER) ? authorizerCheck : true);
        });
    }

    render() {
        const {loading, loadError, onRequestClick} = this.props;
        const filteredRequests = this.getFilteredRequests();
        const StyledBox = ({content}) =>
            <Box display="flex" justifyContent="center">{content}</Box>
        return (<>
            {this.renderUserFilters()}
            {loading && <StyledBox><CircularProgress size={20}/></StyledBox>}
            {loadError && <StyledBox><Typography variant="h6">No se pudieron cargar los datos</Typography></StyledBox>}
            {filteredRequests.length === 0 ?
                <Typography>No hay solicitudes.</Typography> :
                filteredRequests.map((req, index) => (
                    <RequestListCard
                        key={`ticket-${index}`}
                        request={req}
                        onClick={() => onRequestClick(req)}/>
                ))
            }
        </>);
    }
}

function mapStateToProps(state) {
    let checksProps = {};
    varNames.forEach(name => checksProps[name] = state.tickets[name]);
    return checksProps;
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(userFilterChecksActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RequestsScopedList));
