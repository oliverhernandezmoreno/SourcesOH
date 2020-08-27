import React, {Component} from 'react';

import {connect} from 'react-redux';
import {CircularProgress} from '@material-ui/core';
import {Link} from 'react-router-dom';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import {PERMS, userHasPerm} from '@app/permissions';

class Home extends Component {
    state = {
        showTargetList: false
    };

    componentDidMount() {
        const {user} = this.props.auth;
        if (user !== undefined && user !== null) {
            if (userHasPerm(user, {codename: PERMS.authority.e700, fromAnyTarget: true})) {
                // if user has authority perm navigate to list of all form instances
                history.replace(reverse('e700.registry'));
            } else if (userHasPerm(user, {codename: PERMS.miner.e700, fromAnyTarget: true})) {
                // if user has mine group
                if (user.targets.length === 1) {
                    // and if it is linked to one target, navigate to that target
                    const pathParams = {target_canonical_name: user.targets[0].canonical_name};
                    history.replace(reverse('e700.target', pathParams));
                } else {
                    // show list of linked targets
                    this.setState({showTargetList: true});
                }
            }
        }
    }

    render() {
        const {user} = this.props.auth;
        let content = <CircularProgress/>;
        if (this.state.showTargetList) {
            const targetList = user.targets.map(
                (target, index) => {
                    return (
                        <li key={index}>
                            <Link to={reverse('e700.target', {target_canonical_name: target.canonical_name})}>
                                {target.name}
                            </Link>
                        </li>
                    );
                }
            );
            content = (
                <ul>
                    {targetList}
                </ul>
            );
        }
        return (
            <div>
                {content}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        auth: state.auth
    };
}

export default connect(mapStateToProps)(Home);
