import React, {Component} from 'react';
import { FormControl, FormLabel, FormGroup, FormControlLabel,
    Checkbox, withStyles } from '@material-ui/core';


const styles = (theme) => ({
    title: {
        paddingTop: 10
    }
});

class CheckboxGroup extends Component {

    getCheckBox(item, index) {
        const {checkboxProps, enabledStyle} = this.props;
        return (
            <FormControlLabel
                key={index}
                control={
                    <Checkbox
                        {...checkboxProps}
                        style={!item.disabled ? (enabledStyle || null) : null}
                        checked={item.checked}
                        onChange={(event) => item.onChange(event.target.checked)}
                        disabled={item.disabled}
                    />
                }
                label={item.label}
            />
        );
    }

    render() {
        const {data, title, row, classes} = this.props;
        return (
            <FormControl component="fieldset">
                <FormLabel component="legend" className={classes.title}>
                    { title }
                </FormLabel>
                <FormGroup row={row}>
                    { data.map((item, index) => this.getCheckBox(item, index)) }
                </FormGroup>
            </FormControl>
        );
    }
}

export default withStyles(styles)(CheckboxGroup);