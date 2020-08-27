import React from 'react';
import Link from '@material-ui/core/Link';
import HelpIcon from '@material-ui/icons/Help';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030',
    },
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'stretch',
    },
    buttonLink: {
        color: '#24aff4',
        textDecoration: 'underline',
        display: 'flex',
        justifyContent: 'center',
    },
});

const SimpleDialog = (props) => {
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle>Sobre parámetros</DialogTitle>
            <List>
                {props?.description?.map((desc) => (
                    <ListItem text key={desc.name}>
                        <ListItemText primary={desc.name} secondary={desc.description}/>
                    </ListItem>
                )) ?? ''}
            </List>
        </Dialog>
    );
}

const AboutParameter = (props) => {
    const {classes} = props;
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
    };

    return (
        <div className={classes.container}>
            <Link className={classes.buttonLink}
                component="button" variant="body2"
                onClick={event => {
                    handleClickOpen();
                }} >
                <HelpIcon></HelpIcon>
                <span>
                    Sobre este parámetro
                </span>
            </Link>
            <Link className={classes.buttonLink}
                component="button" variant="body2"
                onClick={event => {
                    event.preventDefault();
                }} >
                Ver sectores
            </Link>
            <SimpleDialog
                classes={classes}
                description={props.description}
                open={open}
                onClose={handleClose} >
            </SimpleDialog>
        </div>
    );
}

export default withStyles( styles )( AboutParameter );
