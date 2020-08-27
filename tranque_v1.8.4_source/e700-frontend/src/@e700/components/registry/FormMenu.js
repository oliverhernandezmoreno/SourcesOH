import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Button, List, ListItem, ListItemIcon, ListItemText,
    Collapse, Typography} from '@material-ui/core';
import {MoveToInbox, Visibility, CheckCircleOutline, ErrorOutline,
    AccessTime, FileCopy, ExpandLess, ExpandMore} from '@material-ui/icons';
import {Link} from 'react-router-dom';
import {reverse} from '@app/urls';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        paddingLeft: '50px',
        marginTop: '20px'
    },
    nested: {
        paddingLeft: theme.spacing(4),
        minWidth: '110px'
    },
    text: {
        letterSpacing: '0.21px',
        lineHeight: '20x',
        textAlign: 'left',
        fontSize: '14px',
    },
    card: {
        marginLeft: '20px',
        marginRight: '20px'
    },
    card1: {
        marginLeft: '20px',
        marginRight: '20px'
    },
    list: {
        marginLeft: '5px'
    },
    table: {
        tableLayout: 'fixed',
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '50px'
    },
    th: {
        textAlign: 'center',
        color: 'rgba(0, 0, 0, 0.6)'
    },
    body: {
        backgroundColor: '#F5F5F5'
    },
    text_form: {
        color: '#2664AD',
        fontSize: '24px',
        fontWeight: '300',
        lineHeight: '29px',
        textAlign: 'left',
    },
    title: {
        paddingTop: '1em',
        fontWeight: 'bold',
        letterSpacing: '0.21px',
        lineHeight: '20x',
        textAlign: 'left',
    },
    listItem: {
        minWidth: '110px'
    },
    assignButton: {
        paddingLeft: '50px',
        marginTop: '20px'
    },
});

const sequence = (...fs) => (...args) => fs.reduce((_, f) => f(...args), null);

class FormMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    handleClick = () => {
        this.setState(state => ({open: !state.open}));
    };

    render() {
        const {classes, instances, cases} = this.props;
        const received = [];
        const no_recieved = [];
        const reviewed = [];
        const reviewed_w_comment = [];
        const reviewed_wo_comment = [];
        const newRequests = instances.filter(i => i.form_requests.length > 0 && i.form_requests[0].state === 'created').length;

        instances.forEach(i => {
            switch (i.state) {
                case 'open':
                case 'new_sending':
                case 'new_sent':
                    no_recieved.push(i);
                    break;
                case 'answer_received':
                    received.push(i);
                    break;
                case 'answer_reviewed':
                    reviewed.push(i);
                    if (i.comments.length > 0) {
                        reviewed_w_comment.push(i);
                    } else {
                        reviewed_wo_comment.push(i);
                    }
                    break;
                case 'answer_sending':
                case 'answer_sent':
                case 'closed':
                    // TODO handle unknown state
                    break;
                default:
                    break;
            }
        });

        //TODO crear un objeto para juntar tanto la información de la instancia con la del tranque (nombre empresa, faena, etc)

        return (
            <>
                <List component="nav" className={classes.root}>
                    <Typography className={classes.title}>Registros</Typography>
                    <ListItem button selected={this.props.selectedlistFilter === 'all'} className={classes.listItem}
                        onClick={this.props.setFilter('all')}>

                        <ListItemIcon>
                            <MoveToInbox fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography noWrap className={classes.text}>
                                Todos ({instances.length})
                                </Typography>
                            }
                        />
                    </ListItem>
                    <ListItem button selected={this.props.selectedlistFilter === 'received'} className={classes.listItem}
                        onClick={this.props.setFilter('received')}>

                        <ListItemIcon>
                            <MoveToInbox fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography noWrap className={classes.text}>
                                Recibidos ({received.length})
                                </Typography>
                            }
                        />
                    </ListItem>
                    <ListItem button className={classes.listItem}
                        selected={this.props.selectedlistFilter === 'reviewed-no-comments' ||
                              this.props.selectedlistFilter === 'reviewed-with-comments'}
                        onClick={sequence(
                            this.handleClick,
                            this.props.setFilter('reviewed-no-comments')
                        )}
                    >
                        <ListItemIcon>
                            <Visibility fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography noWrap className={classes.text}>
                                Archivados ({reviewed.length})
                                </Typography>
                            }
                        />
                        {this.state.open ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>
                    <Collapse in={this.state.open} timeout="auto">
                        <List component="div" disablePadding>
                            <ListItem button selected={this.props.selectedlistFilter === 'reviewed-no-comments'}
                                className={classes.nested}
                                onClick={this.props.setFilter('reviewed-no-comments')}
                            >
                                <ListItemIcon className={classes.itemIcon}>
                                    <CheckCircleOutline fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography noWrap className={classes.text}>
                                        Sin observaciones ({reviewed_wo_comment.length})
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <ListItem button selected={this.props.selectedlistFilter === 'reviewed-with-comments'}
                                className={classes.nested}
                                onClick={this.props.setFilter('reviewed-with-comments')}
                            >
                                <ListItemIcon className={classes.itemIcon}>
                                    <ErrorOutline fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography noWrap className={classes.text}>
                                        Con Observaciones ({reviewed_w_comment.length})
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </List>
                    </Collapse>

                    <ListItem button selected={this.props.selectedlistFilter === 'not-received'} className={classes.listItem}
                        onClick={this.props.setFilter('not-received')}>
                        <ListItemIcon className={classes.itemIcon}>
                            <AccessTime fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography noWrap className={classes.text}>
                                Aún por recibir ({no_recieved.length})
                                </Typography>
                            }
                        />
                    </ListItem>
                    <Typography className={classes.title}>Casos</Typography>
                    <ListItem button selected={this.props.selectedlistFilter === 'generated-cases'} className={classes.listItem}
                        onClick={this.props.setFilter('generated-cases')}>
                        <ListItemIcon className={classes.itemIcon}>
                            <FileCopy fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography noWrap className={classes.text}>
                                Casos Generados ({cases.length})
                                </Typography>
                            }
                        />
                    </ListItem>
                    <Typography className={classes.title}>Solicitudes</Typography>
                    <ListItem button selected={this.props.selectedlistFilter === 'new-requests'} className={classes.listItem}
                        onClick={this.props.setFilter('new-requests')}>
                        <ListItemIcon className={classes.itemIcon}>
                            <MoveToInbox fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography noWrap className={classes.text}>
                                Solicitudes recibidas ({newRequests})
                                </Typography>
                            }
                        />
                    </ListItem>
                </List>
                <div className={classes.assignButton}>
                    <Button
                        style={{width: '220px', whiteSpace: 'nowrap', color: '#ffffff', backgroundColor: '#1A76D1'}}
                        variant="contained"
                        component={Link} to={reverse('e700.assign')}
                    >
                        <Typography style={{textTransform: 'capitalize'}}>Asignar Formulario</Typography>
                    </Button>
                </div>
            </>
        );
    }
}

export default withStyles(styles)(FormMenu);
