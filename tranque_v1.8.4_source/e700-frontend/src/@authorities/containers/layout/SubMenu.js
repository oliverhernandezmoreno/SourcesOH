import React, {Component} from 'react';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom';
import classNames from 'classnames';

import history from '@app/history';
import {blue} from '@material-ui/core/colors';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        height: "100%",
        overflow: "auto"
    },
    listRoot:{
        paddingTop: 0,
        paddingBottom: 10
    },
    title: {
        fontSize: 20,
        color: '#ffffff',
        marginLeft: 16,
        marginTop: 16
    },
    expandIcon: {
        color: '#ffffff'
    },
    item: {
        borderRadius: '4px',
        '&.active': {
            backgroundColor: blue[700],
            '&:hover, &:focus': {
                backgroundColor: blue[600]
            }
        }
    },
    nestedItem: {
        backgroundColor: theme.palette.primary.main,
        '&.active': {
            // color: blue[400]
        }
    },
    nestedList: {
        paddingLeft: '1rem',
        paddingRight: '1rem'
    },
    itemSubtitle: {
        color: '#8E8E8E'
    }
});

const stripTrailingSlash = (t) => t.endsWith('/') ? t.slice(0, -1) : t;

class SubMenu extends Component {

    // Singleton used to generate dividers between menu items.
    static Separator() {
    }

    state = {
        open: {}
    };

    goTo(path) {
        return () => history.push(path);
    };

    toggleList(e) {
        return () => {
            this.setState(prevState => ({open: {...prevState.open, [e]: !prevState.open[e]}}));
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const scrollElement = document.getElementById("scrolled-content");
        if (this.props.location !== prevProps.location && scrollElement)
        {
            scrollElement.scrollTop = 0;
        }
    }

    renderListItem({key, onClick, active, title, subtitle, children}) {
        const {classes} = this.props;
        if (children !== undefined) {
            const childrenItems = children.map((child, ci) =>
                this.renderItem(child, `${key}-nested-${ci}`, true));
            const childActive = childrenItems.some(c => c[1]);
            return (
                <React.Fragment key={key}>
                    <ListItem
                        button
                        onClick={this.toggleList(key)}
                        className={classNames(classes.nestedItem, {active: childActive})}>
                        <ListItemText primary={<Typography>{title}</Typography>}/>
                        {this.state.open[key] || childActive ? <ExpandLess className={classes.expandIcon}/> :
                            <ExpandMore className={classes.expandIcon}/>}
                    </ListItem>
                    <Collapse className={classes.nestedList} in={this.state.open[key] || childActive} timeout="auto" unmountOnExit>
                        {childrenItems.map(c => c[0])}
                    </Collapse>
                </React.Fragment>
            );
        } else {
            return (
                <ListItem
                    key={key}
                    onClick={onClick}
                    button={onClick !== undefined}
                    className={classNames(classes.item, {active: active})}>
                    <ListItemText
                        primary={<Typography>{title}</Typography>}
                        secondary={subtitle}
                        secondaryTypographyProps={{className: classes.itemSubtitle}}
                    />
                </ListItem>
            );
        }
    }

    renderItem(item, index) {
        const {location} = this.props;

        if (item === SubMenu.Separator) {
            return <Divider key={`separator-${index}`}/>;
        }

        const itemProps = {
            key: index,
            onClick: undefined,
            active: false,
            title: item.title,
            subtitle: item.subtitle,
            children: item.children
        };

        if (item.path !== undefined && item.path !== null) {
            // Normal link
            itemProps.onClick = this.goTo(item.path);
            itemProps.active = stripTrailingSlash(location.pathname).startsWith(stripTrailingSlash(item.path));
        }

        return [this.renderListItem(itemProps), itemProps.active];
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root}>
                {this.props.title && <Typography className={classes.title}>{this.props.title}</Typography>}
                <List className={classes.listRoot} component="nav">
                    {this.props.items.map((item, i) => this.renderItem(item, i)[0])}
                </List>
            </div>
        );
    }
}

SubMenu.propTypes = {
    classes: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    title: PropTypes.string
};

export default withStyles(styles)(withRouter(SubMenu));
