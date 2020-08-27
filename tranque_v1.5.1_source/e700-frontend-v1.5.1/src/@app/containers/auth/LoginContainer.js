import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';

import Login from '@app/components/auth/Login';
import {authActions} from '@app/actions';
import {reverse} from '@app/urls';
import minerTheme from '@miners/theme';
import {MuiThemeProvider} from '@material-ui/core';

const loginContainer = (props) => {
    if (props.isAuthenticated) {
        let redirectTo = reverse('home');
        if (props.location && props.location.state && props.location.state.redirectTo) {
            redirectTo = props.location.state.redirectTo;
        }
        return (<Redirect to={{pathname: redirectTo}}/>);
    } else {
        return (
            <MuiThemeProvider theme={minerTheme}>
                <Login {...props} />
            </MuiThemeProvider>
        );
    }
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authActions, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(loginContainer);
