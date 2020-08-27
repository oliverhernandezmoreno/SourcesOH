import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {authActions} from '@app/actions';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import {MuiThemeProvider} from '@material-ui/core/styles';
import {CssBaseline} from '@material-ui/core';
import theme from './theme';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {Routes} from '@authorities/Routes';
import {formatUsername} from '@app/services/formatters';
import AppBarContainer from '@app/containers/AppBarContainer';

class Authorities extends SubscribedComponent {

    /**
     * Function triggered to logout.
     *
     * @param {event} the event
     * @public
     */
    logout = (event) => {
        const {actions} = this.props;
        event.preventDefault();
        if (actions) actions.logout();
    };

    getInitialTabValue() {
        const {location} = this.props;
        const pathName = (location && location.pathname) || '';
        if (pathName.includes('/mapa/') || pathName.endsWith('/mapa')) {
            return 2;
        }
        else if (pathName.includes('/incidentes/') && !pathName.includes('/deposito/')) {
            return 3;
        }
        else return 0;
    }

    /**
     * Render this component.
     *
     * @public
     */
    render() {
        const { user, isAuthenticated } = this.props;
        const tabs = [
            /* tabValue = 0 */ {
                name: 'Monitoreo', onClick: (() => history.push(reverse('authorities.home')))
            },
            /* tabValue = 1 */ {
                name: 'Gestión E700', onClick: (() => history.push(reverse('e700')))
            },
            /* tabValue = 2 */ {
                name: 'Mapa de Depósitos', onClick: (() => history.push(reverse('authorities.map')))
            },
            /* tabValue = 3 */ {
                name: 'Alertas e Incidentes', onClick: (() => history.push(reverse('authorities.tickets')))
            }
        ];

        return (
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    {isAuthenticated &&
                        <AppBarContainer
                            onUserExit={this.logout}
                            userName={formatUsername(user)}
                            tabs={tabs}
                            initialTabValue={this.getInitialTabValue()}
                            userRoute='authorities'
                            user={user}
                        />
                    }
                    <Routes/>
                </div>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Authorities);
