import React, {Component} from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Grid, Button, Dialog, DialogContent, DialogActions,
    CircularProgress, withStyles} from '@material-ui/core';
import {ArrowDropDown} from '@material-ui/icons';
import IconStatus from '@miners/components/EF/IconStatus';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import ContainedButton from '@app/components/utils/ContainedButton';
import RadioButtonGroup from '@app/components/utils/RadioButtonGroup';
import {UPPER, LOWER} from '@miners/constants/thresholdTypes';


const borderColor = '#525252';

const styles = (theme) => ({
    container: {
        border: '1px solid',
        borderColor: borderColor,
        borderRadius: 3,
        borderBottom: 'none',
    },
    headerRow: {
        height: 60,
        backgroundColor: theme.palette.secondary.main
    },
    name: {
        whiteSpace: 'normal',
        fontSize: 13,
    },
    body: {
        backgroundColor: theme.palette.secondary.dark,
        '&:hover': {
            cursor: 'pointer'
        }
    },
    cell: {
        borderBottomColor: borderColor,
        padding: 10,
        lineHeight: 1
    },
    bigNumber: { fontSize: 45 },
    bigNumberRow: { height: 66 },
    normalRow: { height: 35 },
    limit: { color: '#46bef3' },
    yellowHeader: { color: '#fdff41' },
    button: {
        border: '1px solid',
        borderColor: borderColor,
        color: '#a1a1a1',
        minWidth: 0
    },
    spinner: {
        color: '#d0d0d0'
    }
});

class ParamStatusCard extends Component {

    state = {
        open: false,
        radioValue: this.props.initialRadioValue || ''
    }

    handleDialog(open) {
        this.setState({open});
    }

    onRadioChange(event) {
        this.setState({radioValue: event.target.value});
    }

    onAccept() {
        this.handleDialog(false);
        this.props.onAcceptOption(this.state.radioValue);
    }

    onCancel() {
        this.setState({radioValue: this.props.initialRadioValue || ''});
        this.handleDialog(false);
    }


    getSpanishThresholdType() {
        const {data : {thresholdType}} = this.props;
        switch(thresholdType) {
            case LOWER: return 'inferior';
            case UPPER: return 'superior';
            default: return '';
        }
    }

    renderDialog() {
        const {open, radioValue} = this.state;
        const {radioOptions} = this.props;
        return <Dialog open={open} onClose={() => this.handleDialog(false)}
            PaperProps={{style: {border: '1px solid', borderColor: '#a1a1a1'}}}>
            <DialogContent>
                <RadioButtonGroup
                    value={radioValue}
                    title={<b>OPCIONES DE VISUALIZACIÓN</b>}
                    data={radioOptions}
                    onChange={(e) => this.onRadioChange(e)}/>
            </DialogContent>
            <DialogActions>
                <ContainedButton
                    text='ACEPTAR'
                    buttonProps={{onClick: () => this.onAccept()}}
                />
                <Button onClick={() => this.onCancel()}>
                    CANCELAR
                </Button>
            </DialogActions>
        </Dialog>
    }

    render() {
        const {classes, yellow, radioOptions, data, loading, goToDetail} = this.props;
        const StyledCell = ({content}) => <TableCell classes={{root: classes.cell}}>{content || '-'}</TableCell>;
        return (<>
            <TableContainer className={classes.container}>
                <Table>
                    <TableHead>
                        <TableRow className={classes.headerRow}>
                            <StyledCell content={<Grid container alignItems='center' justify='space-between'>
                                <Grid item className={classes.name} style={radioOptions ? {width: '70%'} : undefined}>
                                    <div >
                                        <IconTextGrid
                                            icon={
                                                <IconStatus
                                                    value={data.paramValue}
                                                    threshold={data.threshold}
                                                    type={data.serie && data.thresholdType}
                                                    iconProps={{ style: { fontSize: 13 }}}
                                                />
                                            }
                                            text={
                                                <div className={yellow ? classes.yellowHeader : undefined}>
                                                    {(data.title || '-').toUpperCase()}
                                                </div>
                                            }
                                        />
                                    </div>
                                </Grid>
                                { radioOptions &&
                                <Grid item>
                                    <Button size='small'
                                        classes={{root: classes.button}}
                                        onClick={() => this.handleDialog(true)}
                                    >
                                        <ArrowDropDown/>
                                    </Button>
                                </Grid> }
                            </Grid>}/>
                        </TableRow>
                    </TableHead>
                    <TableBody className={classes.body} onClick={goToDetail}>
                        <TableRow className={classes.bigNumberRow}>
                            <StyledCell content={
                                <div className={classes.bigNumber}>
                                    {loading ? <CircularProgress className={classes.spinner}/> : (data.paramValue || '-')}
                                </div>}
                            />
                        </TableRow>
                        <TableRow className={classes.normalRow}>
                            <StyledCell content={data.date || '-'}/>
                        </TableRow>
                        <TableRow className={classes.normalRow}>
                            <StyledCell content={data.sector || '-'}/>
                        </TableRow>
                        <TableRow className={classes.normalRow}>
                            <StyledCell
                                content={ data.threshold !== null && data.threshold !== undefined ?
                                    <Grid container justify='space-between'>
                                        <Grid item className={classes.limit}>
                                           Límite {this.getSpanishThresholdType()} : {data.threshold}
                                        </Grid>
                                        <Grid item>{data.thresholdUnit || '-'}</Grid>
                                    </Grid> : '-'
                                }
                            />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            { radioOptions && this.renderDialog() }
        </>);
    }
}

export default withStyles(styles)(ParamStatusCard);
