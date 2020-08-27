import React from 'react';
import {connect} from 'react-redux';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {Routes} from '@miners/Routes';
import BaseLayout from '@miners/containers/layout/BaseLayout';
import {MuiThemeProvider} from '@material-ui/core/styles';
import minersTheme from '@miners/theme';
import * as TicketsService from '@app/services/backend/tickets';
import {getTypedRequests} from '@alerts_events/containers/RequestsListContainer';
import {bindActionCreators} from 'redux';
import {requestsCounterActions} from '@alerts_events/actions/requestsCounter.actionCreators';

class Miners extends SubscribedComponent {

    state = {
        pendingReceivedRequests: 0,
        resolvedRequestedRequests: 0,
    }

    componentDidMount() {
        this.setRequestsCounter();
    }

    componentDidUpdate(prevProps) {
        const {updateRequestCounter} = this.props;
        if (updateRequestCounter && prevProps.updateRequestCounter !== updateRequestCounter) {
            this.setRequestsCounter();
        }
    }

    /**
     *  Function to get the number of requests of different types
     *  so they can be located in appBar
     */
    setRequestsCounter() {
        const {user, actions} = this.props;
        this.subscribe(
            TicketsService.readNationalAuthorizationRequests(),
            data => {
                const requests = data.data && data.data.results ? data.data.results : [];
                const typedRequests = getTypedRequests(user, requests);
                this.setState({
                    pendingReceivedRequests: typedRequests.pendingReceivedRequests.length,
                    resolvedRequestedRequests: typedRequests.resolvedRequestedRequests.length
                });
                actions.setRequestsCounterUpdating(false);
            }
        );
    }

    render() {
        let content = (
            <Routes/>
        );
        if (this.props.isAuthenticated) {
            content = (
                <BaseLayout ticketRequests={this.state} user={this.props.user}>
                    {content}
                </BaseLayout>
            );
        }
        return <MuiThemeProvider theme={minersTheme}>
            {content}
        </MuiThemeProvider>;
    }
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user,
        updateRequestCounter: state.tickets.update_request_counter
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(requestsCounterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Miners);
