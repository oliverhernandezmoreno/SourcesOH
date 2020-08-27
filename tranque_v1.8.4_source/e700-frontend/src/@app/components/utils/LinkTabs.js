import React, {Component} from 'react';
import {Tabs, Tab, withStyles} from '@material-ui/core';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';

const styles = theme => ({
    profileNavigator: {
        marginBottom: theme.spacing(2)
    },
    profileNavigatorFlexContainer: {
        borderBottomWidth: '4px',
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.secondary.dark
    },
    profileNavigatorIndicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '& > div': {
            width: 'calc(100% - 4px)',
            height: '2px'
        }
    },
    profileNavigatorTabSelected: {
        backgroundColor: theme.palette.secondary.dark
    }
});

class LinkTabs extends Component {

    render() {
        const {classes, location: {pathname}, tabs, tabsProps, tabProps} = this.props;
        const activeTab = (tabs.find(t => pathname.startsWith(t.to)) || {}).to || false;
        return (
            <Tabs
                value={activeTab}
                classes={{
                    root: classes.profileNavigator,
                    flexContainer: classes.profileNavigatorFlexContainer,
                    indicator: classes.profileNavigatorIndicator
                }}
                indicatorColor="primary"
                {...tabsProps}
            >
                {tabs.map((t, i) => (
                    <Tab
                        key={i}
                        component={Link}
                        to={t.to}
                        value={t.to}
                        label={t.label}
                        classes={{
                            selected: classes.profileNavigatorTabSelected
                        }}
                        {...tabProps}
                    />
                ))}
            </Tabs>
        );
    }
}

export default withStyles(styles)(withRouter(LinkTabs));