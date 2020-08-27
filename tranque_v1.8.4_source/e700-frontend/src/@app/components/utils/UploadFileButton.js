import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import * as config from '@app/config';

function transformToArray(fileList) {
    const ret = [];
    for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].size > config.MAX_SIZE_FILE_BT) {
            alert("El archivo seleccionado no puede subirse, debido a que pesa más de " + config.MAX_SIZE_FILE_MB + " MB.");
        }
        else {
            ret.push(fileList[i]);
        }
    }
    return ret;
}

export function UploadFileButton({onFileSelection, disabled, multiple, className, label, buttonProps={}}) {
    const [key, setKey] = useState(Date.now());
    const id = 'file-upload-button-' + Math.random();
    const onChange = event => {
        onFileSelection(transformToArray(event.target.files));
        // update key to force recreation of input and clear from previous files added
        setKey(Date.now());
    };
    return (
        <div className={className}>
            <input
                id={id}
                key={key}
                onChange={onChange}
                multiple={multiple}
                style={{display: 'none'}}
                type="file"
                disabled={disabled}/>
            <label htmlFor={id}>
                <Button
                    component="span"
                    disabled={disabled}
                    variant="contained"
                    color="primary"
                    {...buttonProps}>{label}
                </Button>
            </label>
        </div>
    );
}

UploadFileButton.propTypes = {
    onFileSelection: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};
