import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Grid, Typography} from '@material-ui/core';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {IndexStatusIcon} from '@authorities/components/IndexStatusIcon';
import {NOT_CONFIGURED, RED_ALERT, WITHOUT_ALERT, YELLOW_ALERT} from '@authorities/constants/indexState';
import {Help} from '@material-ui/icons';
import {StyledTooltip} from '@communities/components/target/StyledTooltip';
import SymbologyDialog from '@communities/components/target/SymbologyDialog';
import {connect} from 'react-redux';

const styles = theme => ({
    container: {
        padding: '20px',
        paddingTop: '10px'
    },
    tooltipChild: {
        float: 'left'
    }
});

const title = 'Simbología';

class AlertSymbology extends Component {
    renderContent() {
        const {classes} = this.props;
        return (
            <Grid container direction="column" spacing={1} className={classes.container}>
                <Grid item>
                    <Typography align="left" variant="subtitle1">Estatus de alertas</Typography>
                </Grid>
                <Grid item>
                    <IconTextGrid
                        icon={<IndexStatusIcon status={RED_ALERT} size="default"/>}
                        text={<Typography variant="body2"> Índice asociado a una alerta roja</Typography>}
                        justify="flex-start"/>
                </Grid>
                <Grid item>
                    <IconTextGrid
                        icon={<IndexStatusIcon status={YELLOW_ALERT} size="default"/>}
                        text={<Typography variant="body2"> Índice asociado a una alerta amarilla</Typography>}
                        justify="flex-start"/>
                </Grid>
                <Grid item>
                    <IconTextGrid
                        icon={<IndexStatusIcon status={WITHOUT_ALERT} size="default"/>}
                        text={<Typography variant="body2"> Índice no asociado a alertas visibles para la
                            autoridad</Typography>}
                        justify="flex-start"/>
                </Grid>
                <Grid item>
                    <IconTextGrid
                        icon={<IndexStatusIcon status={NOT_CONFIGURED} size="default"/>}
                        text={<Typography variant="body2"> Índice no configurado</Typography>}
                        justify="flex-start"/>
                </Grid>
            </Grid>
        );
    }

    renderDesktop() {
        const {classes} = this.props;
        return (
            <StyledTooltip
                placement="left"
                title={this.renderContent()}>
                <div className={classes.tooltipChild}>
                    <IconTextGrid
                        icon={<Help fontSize="small"/>}
                        text={<Typography variant="body2">{title}</Typography>}/>
                </div>
            </StyledTooltip>
        );
    }

    renderMobile() {
        return (
            <SymbologyDialog title={title}>
                {this.renderContent()}
            </SymbologyDialog>
        );
    }

    render() {
        const {isMobile} = this.props;
        if (isMobile) {
            return this.renderMobile();
        } else {
            return this.renderDesktop();
        }
    }
}

const mapStateToProps = state => {
    return {
        isMobile: state.public.isMobile
    };
};

export default connect(mapStateToProps, null)(withStyles(styles)(AlertSymbology));
