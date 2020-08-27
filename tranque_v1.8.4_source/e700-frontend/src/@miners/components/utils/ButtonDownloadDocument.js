import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import Button from "@material-ui/core/Button";
import FileDownloadIcon from "@material-ui/icons/GetApp";
import * as TimeseriesService from "@app/services/backend/timeseries";
import CircularProgress from "@material-ui/core/CircularProgress";
import { forkJoin, of } from "rxjs";

const styles = (theme) => ({
    buttonExport: {
        whiteSpace: "nowrap",
    },
    iconExport: {
        marginRight: theme.spacing(0.5),
    },
});

class ButtonDownloadDocument extends SubscribedComponent {
    state = {
        downloading: false,
    };

    downloadOneFile = (target, canonical_name, filename, id) => {
        this.subscribe();
    };

    download = () => {
        const { target, canonical_name, filename, id } = this.props;
        if (target === undefined || target === null) return;
        if (canonical_name === undefined || canonical_name === null) return;

        const ids = Array.isArray(id) ? id : [id];
        const filenames = Array.isArray(filename) ? filename : [filename];

        this.setState({ downloading: true });
        const end = () => this.setState({ downloading: false });

        this.subscribe(
            forkJoin(
                ids.map((id, index) => {
                    if (id.length === 0) return of({});
                    const filename =
                        filenames[index].length > 0 ? filenames[index] : `file_${index}`;

                    return TimeseriesService.downloadDocument({
                        id,
                        target,
                        canonical_name,
                        filename,
                    });
                })
            ),
            end, end, end
        );
    };
    render() {
        const { classes, disabled, label, className } = this.props;
        const { downloading } = this.state;

        return (
            <Button
                className={[classes.buttonExport, className].join(' ')}
                variant="outlined"
                disabled={disabled || downloading}
                onClick={this.download}
            >
                {downloading ?
                    <CircularProgress size={24} className={classes.iconExport} /> :
                    <FileDownloadIcon className={classes.iconExport} />
                }
                {label}
            </Button>
        );
    }
}

ButtonDownloadDocument.defaultProps = {
    label: "Datos",
    filename: "file",
};

ButtonDownloadDocument.propTypes = {
    canonical_name: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    target: PropTypes.string,
    label: PropTypes.node,
    filename: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

export default withStyles(styles)(ButtonDownloadDocument);
