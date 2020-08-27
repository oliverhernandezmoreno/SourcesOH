import React, {Component} from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel,
    Radio, withStyles } from '@material-ui/core';


const styles = (theme) => ({
    title: {
        paddingBottom: 20
    },
    option: {
        paddingBottom: 10
    },
    description: {
        paddingLeft: 30,
        textAlign: 'justify'
    }
});

class RadioButtonGroup extends Component {

    getRadioButton(item, index) {
        const {classes, radioProps} = this.props;
        if (!item || item.value === null || item.value === undefined) return;
        return (<div key={index} className={classes.option}>
            <FormControlLabel
                value={item.value}
                control={
                    <Radio
                        {...radioProps}
                        disabled={item.disabled}
                    />
                }
                label={item.label}
            />
            <div className={classes.description}>{item.description}</div>
        </div>);
    }

    render() {
        const {data, title, value, onChange, classes} = this.props;
        return (
            <FormControl component="fieldset">
                <FormLabel component="legend" className={classes.title}>
                    { title }
                </FormLabel>
                <RadioGroup value={value} onChange={onChange}>
                    { data.map((item, index) => this.getRadioButton(item, index)) }
                </RadioGroup>
            </FormControl>
        );
    }
}

export default withStyles(styles)(RadioButtonGroup);
