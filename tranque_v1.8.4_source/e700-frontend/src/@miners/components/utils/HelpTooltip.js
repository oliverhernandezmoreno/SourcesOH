import React from 'react';
import {Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Help} from '@material-ui/icons';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: '#ffffff',
        padding: theme.spacing(2),
        color: "#000000",
    },
    child: {
        display: 'inline-flex',
        alignItems: 'center',
        color: '#8D8D8D',
        fontSize: '12px',
        cursor: 'default'
    },
    icon: {
        marginRight: theme.spacing(0.5)
    },
}));

export function HelpTooltip({className, text, children}) {
    const classes = useStyles();

    const childClass = classNames(classes.child, className);

    return (
        <Tooltip
            classes={{tooltip: classes.root}}
            placement="top-start"
            title={<>{children}</>}>
            <div className={childClass}>
                <Help className={classes.icon} /> {text}
            </div>
        </Tooltip>
    );
};
