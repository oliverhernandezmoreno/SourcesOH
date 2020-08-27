import React from 'react';
import { Button, withStyles } from '@material-ui/core';


const styles = theme => ({
    disabledButton: {
        background: theme.palette.secondary.main
    },
    button: {
        background: '#197de0',
        color: '#ffffff'
    }
});

const ContainedButton = ({classes, text, buttonProps}) => {
    let btnProps = {...buttonProps};
    if (buttonProps && buttonProps.disabled) {
        btnProps['disabled'] = true;
    }
    return (
        <Button variant='contained'
            className={classes.button}
            classes={{disabled: classes.disabledButton}}
            {...btnProps}>
            {text}
        </Button>
    );
}

export default withStyles(styles)(ContainedButton);