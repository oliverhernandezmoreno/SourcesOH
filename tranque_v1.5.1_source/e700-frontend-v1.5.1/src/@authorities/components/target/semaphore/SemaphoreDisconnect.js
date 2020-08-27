import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Box, Typography, FormControl, TextField } from '@material-ui/core';
import { AttachFile } from '@material-ui/icons';
import { UploadFileButton } from '@app/components/utils/UploadFileButton';
import DisconnectSemaphoreButton from '@authorities/components/target/semaphore/DisconnectSemaphoreButton';

const styles = theme => ({
    root: {
    },
});

/**
 * A component for rendering the box to connect alerts
 */
class SemaphoreDisconnect extends Component {

    state = {
        disconnectionPublicMessage: '',
        selectedFiles: []
    };

    handlePublicMessageChange = (value) => {
        this.setState({disconnectionPublicMessage: value});
    };

    render() {
        const {scope, handleDisconnection} = this.props;

        return (<Box mt={2}>
            <Typography>Detalle del mensaje al conectar el semáforo en el sitio público:</Typography>
            <br></br>
            <FormControl fullWidth variant="outlined">
                <TextField
                    id="disconnection-public-message"
                    label="Mensaje en el Sitio Público"
                    InputLabelProps={{color: 'secondary'}}
                    placeholder="Mensaje de prueba"
                    multiline
                    variant="outlined"
                    onChange={e => this.handlePublicMessageChange(e.target.value)}/>
            </FormControl>

            <Box mt={2}>
                <Typography>Puedes adjuntar documentos que justifiquen la desconexión de los semáforos:</Typography>
                <br></br>
                <Box p={2} bgcolor="primary.main">
                    <Box display="flex" alignItems="center">
                        <Box flexGrow={1}>
                            Adjuntar los documentos que justifiquen la desconexión de los semáforos.<br></br>
                        </Box>
                        <UploadFileButton
                            label='Adjuntar archivo'
                            buttonProps={{
                                startIcon: <AttachFile/>,
                                variant:'contained',
                                color: 'secondary',
                                className: null
                            }}
                            onFileSelection={(files) => this.setState({selectedFiles: files})}
                        />
                    </Box>
                    {this.state.selectedFiles && this.state.selectedFiles.length > 0 ? <Box>
                        <ul>{this.state.selectedFiles.map(f => <li key={f.name}>{f.name}</li>)}</ul>
                    </Box> : null}
                </Box>
            </Box>
            <Box display="flex" justifyContent="flex-end" mt={2}>
                <DisconnectSemaphoreButton
                    disconnectionPublicMessage={this.state.disconnectionPublicMessage}
                    scope={scope}
                    publicMessage={this.state.disconnectionPublicMessage}
                    files={this.state.selectedFiles}
                    handleDisconnection={(comment) => handleDisconnection(comment, this.state.selectedFiles)}/>
            </Box>
        </Box>);
    }
}


SemaphoreDisconnect.propTypes = {};

export default withStyles(styles)(SemaphoreDisconnect);
