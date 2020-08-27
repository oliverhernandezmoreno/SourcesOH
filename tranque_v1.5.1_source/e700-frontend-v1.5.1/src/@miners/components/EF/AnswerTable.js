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

  findChoice = (choices, value) => choices.find(
      (choice) => (typeof choice.value.gt === "undefined" || value > choice.value.gt) &&
          (typeof choice.value.lt === "undefined" || value < choice.value.lt) &&
          (typeof choice.value.gte === "undefined" || value >= choice.value.gte) &&
          (typeof choice.value.lte === "undefined" || value <= choice.value.lte)
  );

  render(){
      const{items,answers,classes} = this.props;
      const ALERT1 = "There is not data received by the component"
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
                      {items !== undefined && answers!== undefined?
                          items.map((values) =>
                              <TableRow key={values.name}>
                                  <TableCell component="th" scope="row">
                                      <Typography className={classes.text}>
                                          {values.name}
                                      </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                      {(answers[values.canonical_name]?
                                          <h4 style={{fontSize: 16, color:'#fdff3f'}}>

                                              {(this.findChoice(values.choices, +answers[values.canonical_name]) || {choice: "No definido"}).choice}
                                          </h4>:
                                          <h4 style={{fontSize:16,color:'#38e47b'}}>
                                              {(this.findChoice(values.choices, +answers[values.canonical_name]) || {choice: "No definido"}).choice}
                                          </h4>
                                      )}
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
