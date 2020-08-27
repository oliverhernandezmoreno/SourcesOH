import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import * as etlService from '@app/services/backend/etl';

const styles = (theme) => ({
    button: {
        color: '#009eff',
        textTransform: 'none',
    },
});

class DownloadDataFileButton extends React.Component {
    download() {
        if (this.props.dataFile && this.props.dataFile.downloadable) {
            etlService.downloadDataFile({
                dataFileId: this.props.dataFile.id,
                filename: this.props.dataFile.filename,
            });
        }
    }

    render() {
        const {dataFile, classes} = this.props;
        return (
            <Button
                className={classes.button}
                disabled={!dataFile || !dataFile.downloadable}
                onClick={this.download.bind(this)}
            >
                {(dataFile || {filename: '-'}).filename}
            </Button>
        );
    }
}

export default withStyles(styles)(DownloadDataFileButton);
