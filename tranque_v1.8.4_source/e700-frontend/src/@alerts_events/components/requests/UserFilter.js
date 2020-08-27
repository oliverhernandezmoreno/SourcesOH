import React, {Component} from 'react';
import {Typography, Grid, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, withStyles} from '@material-ui/core';
import CheckboxGroup from '@app/components/utils/CheckboxGroup';
import { COLORS } from '@miners/theme';
import {Person} from '@material-ui/icons';
import ContainedButton from '@app/components/utils/ContainedButton';

const styles = theme => ({
    message: {
        padding: 20
    },
    deselect: {
        paddingTop: 10
    },
    filterButton: {
        color: COLORS.buttons.contained,
        backgroundColor: '#343434'
    },
    checked: {
        color: COLORS.buttons.contained
    },
    disabled: {
        color: 'f5f5f5'
    }
});

/**
 * A component for rendering a ticket requests list.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class UserFilter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            userChecks: this.props.checks || {}
        };
        this.onCheckboxChange=this.onCheckboxChange.bind(this);
        this.getCheckboxData=this.getCheckboxData.bind(this);
        this.applyFilter=this.applyFilter.bind(this);
        this.onCancel=this.onCancel.bind(this);
    }

    componentDidUpdate(prevProps) {
        const {checks} = this.props;
        if (prevProps.checks !== checks) {
            this.setState({userChecks: checks || {}});
        }
    }

    onCheckboxChange(checked, userId) {
        this.setState({userChecks: {...this.state.userChecks, [userId]: checked}});
    }

    getCheckboxData(userOption) {
        const {user} = this.props;
        const {userChecks} = this.state;
        if (!userChecks || userChecks === {}) return {};
        return {
            label: userOption.username,
            checked: userChecks[userOption.id] || false,
            onChange: (checked) => this.onCheckboxChange(checked, userOption.id),
            disabled: userOption.id === user.id
        };
    }

    handleOpen() { this.setState({open: true}); }

    handleClose() { this.setState({open: false}); }

    applyFilter() {
        const {onUserFilterApply, userFilter} = this.props;
        onUserFilterApply(this.state.userChecks, userFilter);
        this.handleClose();
    }

    deselectAll() {
        const {user} = this.props;
        let deselectedChecks = {};
        Object.keys(this.state.userChecks).forEach(userId => {
            deselectedChecks[userId] = user.id.toString() === userId.toString();
        })
        this.setState({userChecks: deselectedChecks});
    }

    onCancel() {
        this.setState({userChecks: this.props.checks || {}});
        this.handleClose();
    }

    render() {
        const {classes, buttonText, userFilter} = this.props;
        const userOptions = this.props.users.map((user)=>this.getCheckboxData(user));
        return (<div>
            <Button
                variant='contained'
                startIcon={<Person/>}
                className={classes.filterButton}
                onClick={() => this.handleOpen()}>
                {buttonText}
            </Button>
            <Dialog
                open={this.state.open}
                onClose={() => this.onCancel()}
                scroll='paper'>
                <DialogTitle>Filtro por {userFilter}</DialogTitle>
                <Typography variant='body2' className={classes.message}>
                    Selecciona otros usuarios para ver el estado de sus solicitudes y autorizaciones
                </Typography>
                <DialogContent dividers>
                    <CheckboxGroup
                        data={userOptions}
                        enabledStyle={{color: COLORS.buttons.contained}}
                    />
                    <Grid container justify='flex-start' className={classes.deselect}>
                        <Grid item>
                            <Button onClick={() => this.deselectAll()}>DESELECCIONAR TODO</Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <ContainedButton
                        text='APLICAR'
                        buttonProps={{onClick: () => this.applyFilter()}}
                    />
                    <Button onClick={() => this.onCancel()}>CANCELAR</Button>
                </DialogActions>
                <Typography variant='body2' className={classes.message}>
                    Las solicitudes asociadas a tu cuenta de usuario siempre estarán a la vista (no se pueden filtrar)
                </Typography>
            </Dialog>
        </div>);
    }
}

export default withStyles(styles)(UserFilter);
