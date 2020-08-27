import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {Close, Help} from '@material-ui/icons';
import Slide from '@material-ui/core/Slide';
import IconTextGrid from '@app/components/utils/IconTextGrid';

const useStyles = makeStyles(theme => ({
    appBar: {
        position: 'relative',
        backgroundColor: '#6D6D6D'
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1
    },
    button: {
        textTransform: 'None',
        marginLeft: '5px'
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function SymbologyDialog({children, title}) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button className={classes.button} variant="outlined" onClick={handleClickOpen}>
                <IconTextGrid
                    icon={<Help fontSize="small"/>}
                    text={<Typography variant="body2">{title}</Typography>}/>
            </Button>
            <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <Close/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                {children}
            </Dialog>
        </>
    );
}
