import React from 'react';

import { FormGroup, FormControlLabel, Switch, Typography } from '@material-ui/core';

/**
 * A row with switches.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export default function TSwitch({disabled, id, checked, onChange, label}) {
    return (
        <FormGroup row style={{marginLeft: 0, paddingLeft: 0}}>
            <FormControlLabel disabled={disabled} key={id} style={{marginLeft: 0}} 
                control={ <Switch checked={checked}
                    onChange={(event) => onChange(event)}
                    value={checked}
                    color="primary"
                /> }
                label={<Typography variant="caption">{label}</Typography>}
                labelPlacement="start"
            />
        </FormGroup>
    );    
}




