import React from 'react';
import {Redirect, Route} from 'react-router';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {authActions} from '@app/actions';
import {route} from '@app/urls';
import PropTypes from 'prop-types';
import C40X from '@app/components/utils/C40X';
import {PermissionProp, userHasPerm} from '@app/permissions';

const PrivateRoute = ({component: Component, requiredPerm, anyPermOf, userGroups, ...rest}) => {
    const {user, isAuthenticated, isAccessTokenValid, isRefreshTokenValid} = rest;
    return (
        <Route {...rest} render={(props) => {
            if (isAuthenticated) {
                let error_code;
                if (requiredPerm && !requiredPerm.every(p => userHasPerm(user, p))) {
                    error_code = 403;
                } else if (anyPermOf && anyPermOf.length > 0 && !anyPermOf.some(p => userHasPerm(user, p))) {
                    error_code = 403;
                } else if (!isRefreshTokenValid && !isAccessTokenValid) {
                    error_code = 401;
                }
                if (error_code !== undefined) {
                    return <C40X error={error_code} logout={rest.actions.logout}/>;
                }
                return <Component {...props} />;
            } else {
                return <Redirect to={{
                    pathname: route('login'),
                    state: {redirectTo: props.location.pathname}
                }}/>;
            }
        }}/>
    );
};

PrivateRoute.propTypes = {
    requiredPerm: PropTypes.arrayOf(PermissionProp),
    anyPermOf: PropTypes.arrayOf(PermissionProp)
};

function mapStateToProps(state) {
    return {
        user: state.auth.user,
        isAuthenticated: state.auth.isAuthenticated,
        isAccessTokenValid: state.auth.isAccessTokenValid,
        isRefreshTokenValid: state.auth.isRefreshTokenValid
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
