import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import {findChoice} from '@app/services/backend/timeseries';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

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

class AnswerTable extends Component {

    render(){
        const{items,answers,answersEvents,classes} = this.props;
        const ALERT1 = "There is not data received by the component"
        var answersInspect = Object.assign({}, answers, answersEvents)

        return(
            <Paper style={{margin:"20px"}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell component="th">
                                <Typography className={classes.textTitle}>
                                    {this.props.group}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">Opción seleccionada</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items !== undefined && answersInspect !== undefined?
                            items.map((values) =>
                                <TableRow key={values.name}>
                                    <TableCell component="th" scope="row">
                                        <Typography className={classes.text}>
                                            {values.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {answersInspect[values.canonical_name]?
                                            <h4 style={{fontSize: 16, color:'#fdff3f'}}>
                                                {(findChoice(values.choices, +answersInspect[values.canonical_name]) || {choice: "No definido"}).choice}
                                            </h4>:
                                            <h4 style={{fontSize:16, color:'#38e47b'}}>
                                                {(findChoice(values.choices, +answersInspect[values.canonical_name]) || {choice: "No definido"}).choice}
                                            </h4>
                                        }
                                    </TableCell>
                                </TableRow>
                            ):
                            <div style={{margin:"10px",padding: "20px"}}>
                                <Typography className={classes.alertText}>{ALERT1}</Typography>
                            </div>}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}
AnswerTable.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(AnswerTable);
