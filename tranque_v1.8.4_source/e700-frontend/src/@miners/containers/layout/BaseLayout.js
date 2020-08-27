import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Drawer, AppBar, Toolbar,
    List, ListItem, ListItemIcon, ListItemText, Divider, IconButton,
    Collapse, CssBaseline, Menu, MenuItem, Tooltip, Typography, withStyles} from '@material-ui/core';
import {AccountCircle, Assessment, Assignment,
    CloudUpload, ExitToApp, ExpandLess, ExpandMore, Flag,
    Home, RemoveRedEye, Videocam} from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {authActions} from '@app/actions';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import {formatUsername} from '@app/services/formatters';
import {withRouter} from 'react-router-dom';
import {blue} from '@material-ui/core/colors';
import RequestAppBarButtons from '@alerts_events/components/RequestAppBarButtons';

const drawerWidth = 240;

function getIcon(icon) {
    switch (icon) {
        case 'Home':
            return <Home />;
        case 'RemoveRedEye':
            return <RemoveRedEye />;
        case 'Assessment':
            return <Assessment />;
        case 'CloudUpload':
            return <CloudUpload />;
        case 'Inspection':
            return <Assignment />;
        case 'Flag':
            return <Flag />;
        case 'Videocam':
            return <Videocam />;
        default:
            return null;
    }
}

const menuStyle = theme => ({
    expandIcon: {
        color: theme.palette.text.primary
    },
    icon: {
        '&.active': {
            backgroundColor: blue[600]
        },
        borderRadius: '50%',
        padding: 10,
        minWidth: theme.spacing(5),
        minHeight: theme.spacing(5),
    },
    tooltip: {
        backgroundColor: '#ffffff',
        color: theme.palette.primary.main
    },
    text: {
        whiteSpace: 'normal',
        paddingLeft: theme.spacing(3)
    }
});

class DrawerItemClass extends Component {

    state = {
        open: false
    };

    toggle = () => {
        const open = !this.state.open;
        this.setState({open});
        if (open) {
            this.props.onMenuExpand();
        }
    };

    goTo(path) {
        return () => {
            history.push(path);
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (!props.drawerOpen) {
            return {open: false};
        }
        return null;
    }

    isPathActive(path) {
        return this.props.location.pathname.startsWith(path);
    }

    render() {
        const {classes, item, drawerOpen, key } = this.props;

        if (item.children && item.children.length > 0) {
            const ret = [
                <ListItem key={`1-${key}`} button onClick={this.toggle}>
                    <ListItemIcon className={classes.icon}>{item.icon}</ListItemIcon>
                    {drawerOpen && <ListItemText primary={item.title}/>}
                    {this.state.open ? <ExpandLess className={classes.expandIcon}/> :
                        <ExpandMore className={classes.expandIcon}/>}
                </ListItem>
            ];
            if (drawerOpen) {
                ret.push(
                    <Collapse key={`2-${key}`} in={this.state.open} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children.map(
                                (child, index) => (
                                    <ListItem
                                        key={index} button
                                        className={classNames(classes.icon, {active: this.isPathActive(item.path)})}
                                        onClick={this.goTo(child.path)}>
                                        <ListItemText className={classes.text} primary={child.title}/>
                                    </ListItem>
                                )
                            )}
                        </List>
                    </Collapse>
                );
            }
            return ret;
        } else {
            const listItem = (
                <ListItem key={`1-${key}`} button onClick={this.goTo(item.path)}>
                    <ListItemIcon
                        className={classNames(classes.icon, {active: this.isPathActive(item.path)})}
                    >{getIcon(item.icon)}</ListItemIcon>
                    {drawerOpen && <ListItemText className={classes.text} primary={item.title}/>}
                </ListItem>
            );
            if (!drawerOpen) {
                return (
                    <Tooltip
                        classes={{tooltip: classes.tooltip}}
                        placement="right"
                        title={<Typography variant="subtitle1">{item.title}</Typography>}>
                        {listItem}
                    </Tooltip>
                );
            }
            return listItem;
        }
    }
}

export const DrawerItem = withRouter(withStyles(menuStyle, {withTheme: true})(DrawerItemClass));


const styles = theme => ({
    root: {
        display: 'flex',
        height: '100%'
    },
    grow: {
        flexGrow: 1
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    menuButton: {
        marginLeft: 1,
        marginRight: 20
    },
    drawerBackground: {
        backgroundColor: '#161719'
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap'
    },
    drawerOpen: {
        width: drawerWidth,
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        overflowX: 'hidden',
        width: theme.spacing(10),

    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar
    },
    contentWrapper: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    content: {
        width: '100%',
        flexShrink: 1,
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden'
    },
    leftIcon: {
        marginRight: '3px'
    },
    icon: {
        margin: theme.spacing(2),
        color: '#FFFFFF',
        textTransform: 'capitalize'
    }
});

class BaseLayout extends Component {
    state = {
        open: false,
        anchorEl: null,
    };

    handleDrawerOpen = () => {
        this.setState({open: true});
    };

    toggleDrawer = () => {
        this.setState((state) => ({open: !state.open}));
    };

    handleMenuOpen = (event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleMenuClose = () => {
        this.setState({anchorEl: null});
    };

    logout = (event) => {
        event.preventDefault();
        if (this.props.actions) {
            this.props.actions.logout();
        }
    };

    render() {
        const {classes, ticketRequests} = this.props;
        const {anchorEl} = this.state;
        const open = Boolean(anchorEl);

        const userName = formatUsername(this.props.user);

        let drawer, drawerButton;
        if (this.props.items.length > 0) {
            drawer = <Drawer
                variant="permanent"
                className={classNames(classes.drawer, {
                    [classes.drawerOpen]: this.state.open,
                    [classes.drawerClose]: !this.state.open
                })}
                classes={{
                    paper: classNames(classes.drawerBackground, {
                        [classes.drawerOpen]: this.state.open,
                        [classes.drawerClose]: !this.state.open
                    })
                }}
                open={this.state.open}>
                <div className={classes.toolbar}/>
                {/* ^ Empty space under toolbar*/}
                <Divider/>
                <List>
                    {this.props.items.map((item, index) => (
                        <DrawerItem
                            key={index} item={item} drawerOpen={this.state.open}
                            onMenuExpand={this.handleDrawerOpen}>
                        </DrawerItem>
                    ))}
                </List>
                <Divider/>
            </Drawer>;
            drawerButton = <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.toggleDrawer}
                className={classes.menuButton}>
                <MenuIcon/>
            </IconButton>;
        }

        return (
            <div className={classes.root}>
                <CssBaseline/>
                <AppBar
                    position="fixed"
                    className={classNames(classes.appBar, {
                        [classes.appBarShift]: this.state.open
                    })}>
                    <Toolbar>
                        {drawerButton}
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                history.push(reverse('miners.home'));
                            }}>
                            <Home/>
                        </IconButton>
                        <Typography variant="h6" color="inherit" className={classes.grow}>
                        </Typography>
                        <RequestAppBarButtons userRoute='miners' typedRequests={ticketRequests}/>
                        <div>
                            <Typography className={classes.icon}>{userName}</Typography>
                        </div>
                        <div>
                            <IconButton
                                aria-owns={open ? 'menu-appbar' : undefined}
                                aria-haspopup="true"
                                onClick={this.handleMenuOpen}
                                color="inherit">
                                <AccountCircle/>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left'
                                }}
                                getContentAnchorEl={null}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left'
                                }}
                                open={open}
                                onClose={this.handleMenuClose}>
                                <MenuItem onClick={this.logout}>
                                    <ExitToApp className={classes.leftIcon}/>
                                    Cerrar sesión
                                </MenuItem>
                            </Menu>
                        </div>
                    </Toolbar>
                </AppBar>
                {drawer}
                <main className={classes.contentWrapper}>
                    <div className={classes.toolbar}/>
                    {/* Empty space behind toolbar */}
                    <div id="scrolled-content" className={classes.content}>
                        {this.props.children}
                    </div>
                </main>
            </div>
        );
    }
}

BaseLayout.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        items: state.miners.menu.menuItems
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, {withTheme: true})(BaseLayout));
