import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
//import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
//import Avatar from '@material-ui/core/Avatar';
//import Build from '@material-ui/icons/Build';

const styles = theme => ({
    root: {
        backgroundColor: '#000000',
        width: '100%'
    },

    tablecell1: {
        fontSize: '12pt',
        backgroundColor: '#000000',
        color: '#DCDCDC',
        borderBottom: '4px solid #303039'
    },

    tablecell2: {
        fontSize: '10pt',
        backgroundColor: '#000000',
        color: '#ffffff',
        borderBottom: '4px solid #303030'
    },

    avatar3: {
        color: '#fff',
        backgroundColor: '#00FF00',
        width: '15px',
        height: '15px',
        margin: '5px'
    },

    icon1: {
        color: '#ffffff',
        transform: 'rotate(100deg)',
        margin: 5,
        height: 18,
        width: 18
    }
});

const SimpleTableValue = (props) => {
    const {classes} = props;
    return (
        <Table>
            <TableHead>
                <TableRow>{props.header.map((obj, i) =>
                    (<TableCell key={i}
                        className={classes.tablecell1} align="left">{obj.param}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            {/*<TableBody>
          {props.data.map((row, i)=>(
          <TableRow key={i}>
            <TableCell className={classes.tablecell2} align="left">{row.name}</TableCell>
            <TableCell className={classes.tablecell2} align="left">
              {(row.last_value < row.threshold)?
               (<Avatar className={classes.avatar3}/>):
               (<Build className={classes.icon1}/>)}
            </TableCell>
            <TableCell className={classes.tablecell2} align="left">
              {(row.last_value < row.threshold)?
               (<Avatar className={classes.avatar3}/>):
               (<Build className={classes.icon1}/>)}
            </TableCell>
          </TableRow>))}
        </TableBody>*/}
        </Table>
    );
};

SimpleTableValue.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SimpleTableValue);
