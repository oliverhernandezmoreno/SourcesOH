import React from 'react';
import {connect} from 'react-redux';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TargetService from '@app/services/backend/target';
import * as FormService from '@app/services/backend/form';
import FormInstanceList from '@e700/components/instance/FormInstanceList';

class FormInstanceListContainer extends SubscribedComponent {

    state = {
        loading: true,
        instances: [],
        target: {}
    };

    componentDidMount() {
        const target_canonical_name = this.props.match.params.target_canonical_name;
        this.subscribe(
            TargetService.get({canonical_name: target_canonical_name}),
            target => {
                this.setState({target});
                this.subscribe(
                    FormService.listTargetInstances({target: target_canonical_name}),
                    instances => {
                        this.setState({instances, loading: false});
                    }
                );
            }
        );
    }

    onRequestCreate = (newRequest, id) => {
        this.setState(state => {
            const instances = state.instances.map(i => {
                if (i.id===id){
                    return {...i, form_requests:[newRequest, ...i.form_requests]};
                }else{
                    return i;
                }
            })
            return {instances};
        })
    };

    render() {
        const {user} = this.props;
        return (
            <FormInstanceList user={user} {...this.state} onRequestCreate={this.onRequestCreate}/>
        );
    }

}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user
    };
}

export default connect(mapStateToProps)(FormInstanceListContainer);
