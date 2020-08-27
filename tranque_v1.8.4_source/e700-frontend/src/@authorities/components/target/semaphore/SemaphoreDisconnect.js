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
        selectedFiles: [],
        publicMessageBlank: false
    };

    handlePublicMessageChange = (value) => {
        this.setState({
            disconnectionPublicMessage: value,
            publicMessageBlank: value === ""
        });
    };

    validateTextField = () => {
        const {disconnectionPublicMessage} = this.state;
        if (disconnectionPublicMessage === ""){
            this.setState({publicMessageBlank: true});
            return false;
        }else{
            this.setState({publicMessageBlank: false});
            return true; 
        }
    }

    render() {
        const {target, scope, handleDisconnection} = this.props;
        const {disconnectionPublicMessage, selectedFiles, publicMessageBlank} = this.state;

        return (<Box mt={2}>
            <Typography>Detalle del mensaje al conectar el semáforo en el sitio público:</Typography>
            <Box mt={2}>
                <FormControl fullWidth variant="outlined">
                    <TextField
                        required
                        multiline
                        error={publicMessageBlank}
                        id="disconnection-public-message"
                        label="Mensaje en el Sitio Público"
                        InputLabelProps={{color: 'secondary'}}
                        placeholder="Mensaje de prueba"
                        helperText={publicMessageBlank ? "Debe ingresar el mensaje a mostrar en el sitio público" : null}
                        variant="outlined"
                        onChange={e => this.handlePublicMessageChange(e.target.value)}/>
                </FormControl>
            </Box>

            <Box mt={2}>
                <Typography>Puedes adjuntar documentos que justifiquen la desconexión de los semáforos:</Typography>
                <Box mt={2} p={2} bgcolor="primary.main">
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
                    handleDisconnection={handleDisconnection}
                    validateTextField={this.validateTextField}
                    target={target}
                    scope={scope}
                    files={selectedFiles}
                    disconnectionPublicMessage={disconnectionPublicMessage}/>
            </Box>
        </Box>);
    }
}


SemaphoreDisconnect.propTypes = {};

export default withStyles(styles)(SemaphoreDisconnect);
