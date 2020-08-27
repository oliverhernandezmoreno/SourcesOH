import React from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import Home from '@material-ui/icons/Home';
import IconButton from '@material-ui/core/IconButton';
import {Routes} from '@e700/Routes';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {authActions} from '@app/actions';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import {MuiThemeProvider} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import e700Theme from '@e700/theme';
import AppBarContainer from '@app/containers/AppBarContainer';
import {PERMS, userHasPerm} from '@app/permissions';

const MINER_PERM = {codename: PERMS.miner.e700, fromAnyTarget: true};
const AUTHORITY_PERM = {codename: PERMS.authority.e700, fromAnyTarget: true};

export class E700 extends SubscribedComponent {

    /**
     * Function triggered to logout.
     *
     * @param {event} the event
     * @public
     */
    logout = (event) => {
        event.preventDefault();
        if (this.props.actions) {
            this.props.actions.logout();
        }
    };

    /**
     * Function triggered to get the corresponding home tab according to user type.
     *
     * @public
     */
    getUserTabs() {
        const {user} = this.props;
        if (user) {
            const authority_perms = [
                {codename: PERMS.authority.emac, fromAnyTarget: true},
                {codename: PERMS.authority.ef, fromAnyTarget: true}
            ];
            const hasE700perm = userHasPerm(user, {codename: PERMS.authority.e700, fromAnyTarget: true});
            const hasAuthPerm = authority_perms.some(p => userHasPerm(user, p));
            return [
                hasAuthPerm ? {
                    name: 'Monitoreo', onClick: (() => history.push(reverse('authorities.home')))
                } : null,
                hasE700perm ? {
                    name: 'Gestión E700', onClick: (() => history.push(reverse('e700')))
                } : null,
                hasAuthPerm ? {
                    name: 'Mapa de Depósitos',
                    onClick: (() => history.push(reverse('authorities.map')))
                } : null,
                hasAuthPerm ? {
                    name: 'Alertas e Incidentes',
                    onClick: (() => history.push(reverse('authorities.tickets')))
                } : null
            ].filter(tab => tab !== null);
        }
        return [];
    }

    /**
     * Render this component.
     *
     * @public
     */
    render() {
        const {user} = this.props;
        let optionalButton;
        if (userHasPerm(user, MINER_PERM)) {
            optionalButton = (
                <IconButton
                    color='inherit'
                    onClick={() => history.push(reverse('miners.home'))}>
                    <Home/>
                </IconButton>
            );
        }
        const userRoute = userHasPerm(user, AUTHORITY_PERM) ? 'authorities' : 'miners';
        return (
            <MuiThemeProvider theme={e700Theme}>
                <CssBaseline/>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <AppBarContainer
                        optionalButton={optionalButton}
                        onUserExit={this.logout}
                        userName={user.username}
                        tabs={this.getUserTabs()}
                        initialTabValue={1}
                        userRoute={userRoute}
                        user={user}
                    />
                    <div style={{flexGrow: 1}}>
                        <Routes/>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.auth.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(E700);

export function isDisabled(state, edit) {
    return (state !== 'open') || (state === 'open' && edit === false);
}
