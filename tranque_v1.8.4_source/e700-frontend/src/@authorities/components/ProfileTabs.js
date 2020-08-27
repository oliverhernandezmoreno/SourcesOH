import React from 'react';
import {Tabs, Tab, withStyles} from '@material-ui/core';

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

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';
const EF_EMAC_CANONICAL_NAME = 'ef+emac';

const ProfileTabs = ({classes, handleChange, tabValue, both}) => {
    return (
        <Tabs style={{paddingLeft: 16}}
            classes={{
                root: classes.profileNavigator,
                flexContainer: classes.profileNavigatorFlexContainer,
                indicator: classes.profileNavigatorIndicator
            }}
            indicatorColor="primary"
            value={tabValue || (both ? EF_EMAC_CANONICAL_NAME : EF_CANONICAL_NAME)}
            onChange={handleChange}>
            { both &&
                <Tab
                    classes={{
                        selected: classes.profileNavigatorTabSelected
                    }}
                    value={EF_EMAC_CANONICAL_NAME}
                    label="EF+EMAC"
                />
            }
            <Tab
                classes={{
                    selected: classes.profileNavigatorTabSelected
                }}
                value={EF_CANONICAL_NAME}
                label="EF"
            />
            <Tab
                classes={{
                    selected: classes.profileNavigatorTabSelected
                }}
                value={EMAC_CANONICAL_NAME}
                label="EMAC"
            />
        </Tabs>
    );
}

export default withStyles(styles)(ProfileTabs);
