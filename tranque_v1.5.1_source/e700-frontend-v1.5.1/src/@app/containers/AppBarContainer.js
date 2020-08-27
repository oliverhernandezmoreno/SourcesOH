import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {requestsCounterActions} from '@alerts_events/actions/requestsCounter.actionCreators';
import * as TicketsService from '@app/services/backend/tickets';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import TAppBar from '@app/components/TAppBar';
import {getTypedRequests} from '@alerts_events/containers/RequestsListContainer';

class AppBarContainer extends SubscribedComponent {

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
        const appBarProps = this.props;
        return (
            <TAppBar {...appBarProps}
                typedRequests={this.state}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        updateRequestCounter: state.tickets.update_request_counter
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(requestsCounterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBarContainer);
