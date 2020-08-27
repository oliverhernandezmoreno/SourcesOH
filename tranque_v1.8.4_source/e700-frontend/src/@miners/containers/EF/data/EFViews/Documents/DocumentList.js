import React, {Component} from "react";
import PropTypes from 'prop-types';
import { Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Card from '@material-ui/core/Card';

const styles = (theme) => ({
    switchBox: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        background: "#262629",
        // borderRadius: "5px",
        padding: theme.spacing(2),
        border: "1px solid #6d6d6d;",
        borderBottom: "none",
    },
    container: {
        backgroundColor: '#303030',
        paddingTop: '0.5em',
    },
    bottomContent: {
        width: '100%',
        position: 'relative',
        padding: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
    },
    lastRow: {
        borderBottom: "1px solid #6d6d6d",
        borderRadius: `0 0 ${theme.spacing(1)}px ${theme.spacing(1)}px`,
    },

    firstRow: {
        borderRadius: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0 `,
    },
    switchDescription: {
        alignSelf: "center",
    },
    details__disclaimer: {
        marginBottom: "1.5rem",
    },
    collapsableRow: {
        border: "1px solid #6d6d6d;",
        // borderTop: "none",
        // borderBottom: "none",
        background: "#262629",
    },
    button: {
        whiteSpace: 'pre',
        color: '#01aff4',
        border: '1px solid #01aff4',
        '&:disabled': {
            backgroundColor: '#424242',
        }
    },
    introParagraph: {
        paddingBottom: '2em',
    },
});

const useStyles = makeStyles(styles);

const FormattedListItem = ({ className, children, ...otherProps }) => {
    const classes = useStyles();

    return (
        <ListItem
            className={[classes.switchBox, className].join(" ")}
            {...otherProps}
        >
            {children}
        </ListItem>
    );
};

const SwitchLabel = ({ children }) => {
    const classes = useStyles();

    return (
        <Typography
            component="div"
            variant="body1"
            color="textSecondary"
            className={classes.switchDescription}
        >
            <Box fontWeight="fontWeightBold">{children}</Box>
        </Typography>
    );
};

const SwitchListItem = ({
    className,
    text,
    isFirst,
    isLast,
}) => {
    const classes = useStyles();

    return (
        <FormattedListItem
            className={[
                isFirst ? classes.firstRow : "",
                isLast ? classes.lastRow : "",
                className,
            ].join(" ")}
        >
            <ListItemText
                id="switch-list-label-wifi"
                primary={<SwitchLabel>{text}</SwitchLabel>}
            />
            <ListItemSecondaryAction>
                fdsfds
            </ListItemSecondaryAction>
        </FormattedListItem>
    );
};

const CollapsableListItem = ({
    open,
    title,
    itemCount,
    onTitleClick,
    listItemProps,
    itemsStatus,
    items,
    isFirst,
    isLast,
}) => {
    const classes = useStyles();
    return (
        <React.Fragment>
            <FormattedListItem
                className={
                    [isFirst ? classes.firstRow : "", isLast && !open ? classes.lastRow : ""].join(' ')
                }
                button
                onClick={onTitleClick}
                {...listItemProps}
            >
                <ListItemText primary={<SwitchLabel>{title}</SwitchLabel>}/>
                <ListItemText secondary={itemCount} align={'right'}/>
                {open ? <ExpandLess /> : <ExpandMore />}
            </FormattedListItem>
            <Collapse in={open} timeout="auto" unmountOnExit className={isLast ? classes.lastRow : "" }>
                <TableContainer component={Paper}>
                    <Table className={[classes.collapsableRow, isLast ? classes.lastRow : ""].join(' ')} size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Documento</TableCell>
                                <TableCell align="right">Fecha de ingreso</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {items.map((row) => (
                                <TableRow key={row.name}>
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="right">{row.date}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            className={classes.button}
                                            onClick={() => {}}>
                                            <GetAppIcon />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* <List
                    component="div"
                    disablePadding
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
              Por favor indica los sectores donde se presenta el problema
                        </ListSubheader>
                    }
                    className={[classes.collapsableRow, isLast ? classes.lastRow : ""].join(' ')}
                >
                    {items.map(({ id, label }, index) => {
                        return (
                            <React.Fragment key={id}>
                                <ListItem className={classes.nested} >
                                    <ListItemText
                                        id="switch-list-label-wifi"
                                        primary={
                                            <Typography
                                                component="div"
                                                variant="body1"
                                                color="textSecondary"
                                            >
                                                {label}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        sfdfds
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < items.length && <Divider variant="middle" component="li" />}
                            </React.Fragment>
                        );
                    })}
                </List> */}
            </Collapse>
        </React.Fragment>
    );
};

class DocumentList extends Component {

    constructor(props){
        super(props);
        const documentsData = [{ 
            id: 1, 
            label:'[Nombre del sector 1]', 
            list: [
                {id: 2, name:'dsa', link: '/download', date: '11-11-2011' }
            ] 
        },{ 
            id: 2, 
            label:'[Nombre del sector 2]', 
            list: [
                {id: 2, name:'dsa', link: '/download', date: '11-11-2011' }
            ] 
        },{ 
            id: 3, 
            label:'[Nombre del sector 3]', 
            list: [
                {id: 2, name:'dsa', link: '/download', date: '11-11-2011' }
            ] 
        },{ 
            id: 4, 
            label:'[Nombre del sector 4]', 
            list: [
                {id: 2, name:'dsa', link: '/download', date: '11-11-2011' }
            ] 
        },];
        const collapsableItemsStatus = {};
        documentsData.forEach(obj => {
            collapsableItemsStatus[obj?.id] = false;
        });
        this.state = {
            collapsableItemsStatus,
            documentsData,
        };
    }

    onCollapsableItemClick = (id, event) => {
        this.setState({
            collapsableItemsStatus: {
                ...this.state.collapsableItemsStatus,
                [id]: !this.state.collapsableItemsStatus[id],
            }
        })
    }

    render() {
        const { classes, disableActions } = this.props;
        return <div>
            <Typography variant='body2' color="textSecondary" className={classes.introParagraph}>
                    Documentos con información sobre módulos de deformación y 
                    resistencia al corte del material de relleno del muro del depósito.
            </Typography>

            <Button
                className={classes.button}
                onClick={() => {}}
                disabled={disableActions}>
                <AddCircleIcon />
                <span className={classes.buttonLabel}>
                        Añadir documento
                </span>
            </Button>
            <Paper className={classes.root}>
                <Card className={classes.container}>
                    <List>
                        {this.state.documentsData.map(({ id, label, list }, index) => {
                            if (!list) {
                                return (
                                    <SwitchListItem
                                        isFirst={index === 0}
                                        isLast={index === this.state.documentsData.length - 1}
                                        key={id}
                                        text={label}
                                    />
                                );
                            }

                            return (
                                <CollapsableListItem
                                    isFirst={index === 0}
                                    isLast={index === this.state.documentsData.length - 1}
                                    key={id}
                                    open={this.state.collapsableItemsStatus?.[id]}
                                    title={label}
                                    itemCount={list?.length ?? 0}
                                    items={list}
                                    itemsStatus={this.props.switchPanelItemsStatus}
                                    onTitleClick={(event) => this.onCollapsableItemClick(id, event)}
                                />
                            );
                        })}
                    </List>
                </Card>
            </Paper>    
        </div>
    };
}

DocumentList.propTypes = {
    /* Data needed to query the backend, TBD*/
    section: PropTypes.object.isRequired,
};

export default withStyles(styles)(DocumentList);
