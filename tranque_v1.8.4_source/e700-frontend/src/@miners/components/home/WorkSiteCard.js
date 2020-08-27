import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {Paper} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {Link} from 'react-router-dom';

import {reverse} from '@app/urls';
import {PERMS, userHasPerm} from '@app/permissions';

const styles = theme => ({
    root: {
        width: '100%',
        minHeight: '40%',
        marginTop: '40px'
    },
    row: {
        background: '#161719'
    },
    cell: {
        align: 'left',
        size: 'small'
    },
    button: {
        background: '#1A76D1',
        borderRadius: '3px',
        minWidth: '173px',
        height: '36px',
        margin: '5px'
    }
});


export const WorkSiteCard = withStyles(styles)(class extends Component {

    getTargetRow(target, index) {
        const {classes, user} = this.props;
        const ef = userHasPerm(user, {codename: PERMS.miner.ef, target: target.canonical_name});
        const emac = userHasPerm(user, {codename: PERMS.miner.emac, target: target.canonical_name});
        const e700 = userHasPerm(user, {codename: PERMS.miner.e700, target: target.canonical_name});
        return (
            <TableRow key={index} className={classes.row}>
                <TableCell className={classes.cell}>{target.name}</TableCell>
                <TableCell className={classes.cell}>{target.state}</TableCell>
                <TableCell className={classes.cell}>
                    {ef && <Button
                        className={classes.button}
                        component={Link}
                        to={reverse('miners.target.ef.dashboard', {target: target.canonical_name})}>
                        Estabilidad Física
                    </Button>}
                    {emac && <Button
                        className={classes.button}
                        component={Link}
                        to={reverse('miners.target.emac.dashboard', {target: target.canonical_name})}>
                        Aguas Circundantes
                    </Button>}
                    {e700 && <Button
                        className={classes.button}
                        component={Link}
                        to={reverse('e700.target', {target_canonical_name: target.canonical_name})}>
                        Formularios e700
                    </Button>}
                </TableCell>
            </TableRow>
        );
    }

    render() {
        const {classes, workSite} = this.props;
        return (
            <Card className={classes.root}>
                <CardContent>
                    <Typography>
                        {workSite.name}
                    </Typography>
                    <Paper style={{marginTop: '20px'}}>
                        <Table>
                            <TableHead>
                                <TableRow className={classes.row}>
                                    <TableCell align="left" className={classes.cell}>Nombre de depósito</TableCell>
                                    <TableCell align="left" className={classes.cell}>Estado</TableCell>
                                    <TableCell align="left" className={classes.cell}>Monitoreo y datos</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {workSite.targets.map((target, index) => this.getTargetRow(target, index))}
                            </TableBody>
                        </Table>
                    </Paper>
                </CardContent>
            </Card>
        );
    }
});

WorkSiteCard.propTypes = {
    user: PropTypes.object.isRequired,
    workSite: PropTypes.object.isRequired
};
