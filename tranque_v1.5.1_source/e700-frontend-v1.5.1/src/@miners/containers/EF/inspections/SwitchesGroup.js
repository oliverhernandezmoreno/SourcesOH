import React from 'react';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';

export default function SwitchesGroup() {
    const [state, setState] = React.useState({
        option1: true,
        option2: false,
        option3: true,
    });

    const handleChange = name => event => {
        setState({ ...state, [name]: event.target.checked });
    };

    return (
        <div>
            <div>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Nombre Lista</FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch checked={state.gilad} onChange={handleChange('option')} value="option1" />}
                            label="Opción 1"
                        />
                        <FormControlLabel
                            control={<Switch checked={state.jason} onChange={handleChange('option2')} value="option2" />}
                            label="Opción 2"
                        />
                        <FormControlLabel
                            control={
                                <Switch checked={state.antoine} onChange={handleChange('option3')} value="option3" />
                            }
                            label="Opción 3"
                        />
                    </FormGroup>
                    <FormHelperText>Opción</FormHelperText>
                </FormControl>
            </div>
        </div>
    );
}
