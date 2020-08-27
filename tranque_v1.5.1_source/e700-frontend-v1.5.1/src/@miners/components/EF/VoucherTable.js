import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import * as moment from 'moment';

const styles = theme => ({
    root: {
        width: '50%',
        marginTop: theme.spacing(3),
    },
    table: {
        minWidth: 400
    },
    textTitle:{
        fontSize:18,
        fontWeight:"bold",
        textTransform:"capitalize"
    },
    text:{
        fontSize:18
    },
    textAlert:{
        fontSize:20,
        fontWeight:"bold"
    },
});


class voucherTable extends Component {
    render(){
        const{items,group,classes} = this.props;
        var date = moment.utc().format(items.changed_state);
        var stillUtc = moment.utc(date).toDate();
        var local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
        return(
            <Paper style={{margin:"20px"}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell component="th">
                                <Typography className={classes.textTitle}>
                                    {group}
                                </Typography>
                            </TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">
                                <Typography className={classes.text}>
                                    Fecha de inspección
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography className={classes.text}>
                                    {local}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">
                                <Typography className={classes.text}>
                                      Estado
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                {items.state === "success"?
                                    <Typography className={classes.text}>
                                      Realizada
                                    </Typography>:
                                    <Typography className={classes.text}>
                                      No Realizada
                                    </Typography>}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">
                                <Typography className={classes.text}>
                                        Usuario
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography className={classes.text}>
                                    {items.user.username}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">
                                <Typography className={classes.text}>
                                        Datos registrados
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography className={classes.text}>
                                    {items.data_count}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}
voucherTable.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(voucherTable);
