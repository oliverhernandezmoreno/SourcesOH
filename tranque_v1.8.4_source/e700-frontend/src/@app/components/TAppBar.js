import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, IconButton, Menu, MenuItem, Tab, Tabs, Toolbar, Typography} from '@material-ui/core';
import {AccountCircle, ExitToApp} from '@material-ui/icons';
import {HideOnScroll} from '@app/components/utils/HideOnScroll';
import RequestAppBarButtons from '@alerts_events/components/RequestAppBarButtons';

const styles = theme => ({
    AppBar: {
        backgroundColor: theme.palette.primary.main,
    },
    username: {
        [theme.breakpoints.down("xs")]: {
            display: "none"
        }
    }
});


/**
* An AppBar component for Tranque.
*
* @version 1.0.0
* @author [Natalia Vidal](https://gitlab.com/nattoV)
*/
class TAppBar extends Component {
    state = {
        anchorEl: null, //The DOM element used to set the position of the dropdown menu.
        tabValue: this.props.initialTabValue ? this.props.initialTabValue : 0
    };

    /**
    * Function triggered to change the selected tab.
    *
    * @public
    */
    handleTabChange = (event, value) => {
        this.setState({tabValue: value});
    };

    /**
    * Function triggered to open the dropdown menu.
    *
    * @param {event} the event
    * @public
    */
    handleMenuOpen = (event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    /**
    * Function triggered to close the dropdown menu.
    *
    * @public
    */
    handleMenuClose = () => {
        this.setState({anchorEl: null});
    };


    /**
    * Function triggered to render tabs.
    *
    * @public
    */
    renderTabs() {
        return (
            <Tabs value={this.state.tabValue}
                onChange={this.handleTabChange}>
                {(this.props.tabs || []).map((tab, index) => {
                    if (tab) return (<Tab key={index} label={tab.name} onClick={tab.onClick}/>);
                    return '';
                })}

            </Tabs>
        );
    }

    getOptionalButton() {
        return this.props.optionalButton ? this.props.optionalButton : '';
    }

    /**
    * Render this component.
    *
    * @public
    */
    render() {
        const {classes, onUserExit, userName, typedRequests, userRoute} = this.props;
        return (
            <>
                <HideOnScroll>
                    <AppBar>
                        <Toolbar className={classes.AppBar}>
                            {this.getOptionalButton()}
                            {this.renderTabs()}
                            <RequestAppBarButtons
                                typedRequests={typedRequests}
                                userRoute={userRoute}
                            />
                            <div style={{flexGrow: 1}}/>
                            {/*Space between tabs and username*/}
                            <Typography className={classes.username}>{userName}</Typography>
                            <div>
                                <IconButton
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={this.handleMenuOpen}>
                                    <AccountCircle/>
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={this.state.anchorEl}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left'
                                    }}
                                    getContentAnchorEl={null}
                                    open={Boolean(this.state.anchorEl)}
                                    onClose={this.handleMenuClose}>
                                    <MenuItem onClick={onUserExit}>
                                        <ExitToApp/>
                                        Cerrar sesión
                                    </MenuItem>
                                </Menu>
                            </div>
                        </Toolbar>
                    </AppBar>
                </HideOnScroll>
                {/*Empty toolbar for padding*/}
                <Toolbar/>
            </>
        );
    }
}

TAppBar.propTypes = {
    onUserExit: PropTypes.func.isRequired,
    userName: PropTypes.string.isRequired
};


export default withStyles(styles)(TAppBar);
