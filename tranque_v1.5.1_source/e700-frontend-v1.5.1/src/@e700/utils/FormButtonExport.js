import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import Button from '@material-ui/core/Button';
import FileDownloadIcon from '@material-ui/icons/GetApp';
import * as FormService from '@app/services/backend/form';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
    buttonExport: {
        whiteSpace: 'nowrap',
        marginTop: '30px'
    },
    iconExport: {
        marginRight: theme.spacing(0.5)
    }
});

class FormButtonExport extends SubscribedComponent {

    state = {
        downloading: false
    };

    downloadFile = () => {
        const {form_codename, instance_ids, uncheckInstances} = this.props;
        if (instance_ids.length > 0) {
            this.setState({downloading: true});
            this.subscribe(
                FormService.exportFile({
                    form_codename,
                    instance_ids
                }),
                () => {
                    this.setState({downloading: false});
                    uncheckInstances();
                }
            );
        }
    };

    render(props) {
        const {classes} = this.props;
        const {downloading} = this.state;
        
        return (
            <Button
                className={classes.buttonExport}
                variant="outlined"
                disabled={downloading}
                onClick={this.downloadFile}>
                {downloading ?
                    <CircularProgress size={24} className={classes.iconExport}/> :
                    <FileDownloadIcon className={classes.iconExport}/>
                }
          Descargar Registros
            </Button>
        );
    }
}

FormButtonExport.propTypes = {
    form_codename: PropTypes.string.isRequired
};

export default withStyles(styles)(FormButtonExport);
