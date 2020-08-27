import React from 'react';
import { Button, Snackbar, withStyles } from '@material-ui/core';
import * as DataSourceService from '@app/services/backend/dataSources';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import GetAppIcon from '@material-ui/icons/GetApp';
import MuiAlert from '@material-ui/lab/Alert';
import IconTextGrid from '@app/components/utils/IconTextGrid';

const styles = theme => ({
    fileDownloadButton: {
        color: '#01aff4',
        border: '1px solid #01aff4',
    },
});


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class DownloadSheetButton extends SubscribedComponent {

    state = {
        open: false,
        severity: 'error',
        message: 'Error en descarga de ficha técnica'
    }

    SnackBar(message, severity) {
        const {open} = this.state;
        const handleClose = () => this.setState({open: false});
        return <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Alert onClose={handleClose} severity={severity}>{message}</Alert>
        </Snackbar>
    }

    downloadSheet() {
        const {target, dataSource} = this.props;
        this.setState({isLoading: true});
        if (dataSource?.sheet) {
            this.subscribe(
                DataSourceService.downloadDataSourceSheet({
                    target : target,
                    datasource_id: dataSource?.id,
                    filename: dataSource?.sheet?.name,
                }),
                () => this.setState({isLoading: false}),
                () => this.setState({
                    open: true,
                    severity: 'error',
                    message: 'Error en la descarga',
                    isLoading: false
                })
            );
        }
        else this.setState({
            open: true,
            severity: 'info',
            message: 'Ficha no disponible',
            isLoading: false
        })
    }

    render() {
        const { classes, dataSource } = this.props;
        const { isLoading, message, severity } = this.state;
        return (<>
            <Button
                className={classes.fileDownloadButton}
                disabled={isLoading || !dataSource}
                onClick={() => this.downloadSheet()}
            >
                <IconTextGrid icon={<GetAppIcon />} text='FICHA TÉCNICA'/>
            </Button>
            {this.SnackBar(message, severity)}
        </>);
    }
}

export default withStyles(styles)(DownloadSheetButton);
