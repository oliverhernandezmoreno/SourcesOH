import React from 'react';
import {
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import Warning from '@material-ui/icons/Warning';
import {blue} from '@material-ui/core/colors';
import classNames from 'classnames';
import {history} from '@app/history';

const styles = (theme) => ({
    header: {
        marginLeft: '20px',
        '& p': {
            fontSize: '20px'
        },
        '& small': {
            color: theme.palette.text.secondary
        }
    },
    paper: {
        padding: '20px 10px 5px 10px'
    },
    loading: {
        color: 'white',
        marginTop: '1rem'
    },
    warning: {
        padding: '5px',
    },
    iconNextToText: {
        verticalAlign: 'bottom'
    },
    item: {
        borderRadius: '4px',
        '&.active': {
            backgroundColor: blue[700],
            '&:hover, &:focus': {
                backgroundColor: blue[600]
            }
        }
    }
});

const TicketMenu = ({classes, loading, errorLoading, children, subtitle}) => (
    <Paper className={classes.paper}>
        <div className={classes.header}>
            <Typography>Tickets de alertas y eventos</Typography>
            <Typography><small>{subtitle}</small></Typography>
        </div>
        {loading && <CircularProgress className={classes.loading} />}
        {!loading && errorLoading && <Typography color='error' className={classes.warning}>
            <Warning className={classes.iconNextToText} /> Hubo un error al cargar los datos
        </Typography>}
        <List component="nav">
            {children}
        </List>
    </Paper>
);

const Item = ({classes, total, link, active, children}) => (
    <ListItem className={classNames(classes.item, {active})}
        button selected={active}
        onClick={() => history.push(link)}>
        <ListItemText>
            {children} {total > 0 && <>({total})</>}
        </ListItemText>
    </ListItem>
);

TicketMenu.Item = withStyles(styles)(Item);

export default withStyles(styles)(TicketMenu);
