import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import Button from '@material-ui/core/Button';
import FileDownloadIcon from '@material-ui/icons/GetApp';
import * as TimeseriesService from '@app/services/backend/timeseries';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
    buttonExport: {
        whiteSpace: 'nowrap'
    },
    iconExport: {
        marginRight: theme.spacing(0.5)
    }
});

class ButtonExport extends SubscribedComponent {

    state = {
        downloading: false
    };

    filename = () => {
        const { source_name, description, filename } = this.props;
        if (source_name === null || source_name === undefined ||
            description === null || description === undefined) {
            return filename;
        }
        return [
            source_name.replace(/\s+/g, '_'),
            '_',
            description.replace(/\s+/g, '_'),
            '.xlsx'
        ].join('').toLowerCase();
    };

    downloadFile = () => {
        const { target, canonical_name, dateFrom, dateTo, head } = this.props;
        if (Array.isArray(canonical_name) && canonical_name.length === 0) {
            return;
        }
        this.setState({ downloading: true });
        const end = () => this.setState({ downloading: false });
        this.subscribe(TimeseriesService.exportMany({
            target,
            canonical_names: canonical_name,
            filename: this.filename(),
            dateFrom,
            dateTo,
            head: !!head
        }), end, end, end);
    };

    render() {
        const { classes, disabled, label } = this.props;
        const { downloading } = this.state;

        return (
            <Button
                className={classes.buttonExport}
                variant="outlined"
                disabled={disabled || downloading}
                onClick={this.downloadFile}>
                {downloading ?
                    <CircularProgress size={24} className={classes.iconExport} /> :
                    <FileDownloadIcon className={classes.iconExport} />
                }
                {label}
            </Button>
        );
    }
}

ButtonExport.defaultProps = {
    label: 'Datos',
}

ButtonExport.propTypes = {
    label: PropTypes.node,
    target: PropTypes.string,
    canonical_name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    source_name: PropTypes.string,
    description: PropTypes.string,
    filename: PropTypes.string,
    dateFrom: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    dateTo: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    head: PropTypes.bool,
    disabled: PropTypes.bool
};

export default withStyles(styles)(ButtonExport);
