import React, {Component} from 'react';
import {FormControlLabel, Radio, RadioGroup, TextField, withStyles} from '@material-ui/core';
import {isDisabled} from '@e700/e700';


const styles = theme => ({
    textField: {
        paddingBottom: 23
    },
    radio: {
        '&$checked':{
            color: theme.palette.primary.main
        }
    },
    checked: {},
    textLabel: {
        color: 'inherit'
    }
});

class OtherRadioGroup extends Component {

    state = {
        textValues: [],
        checkedValue: {}
    };

    handleChange = event => {
        const checked = this.state.textValues.find(option => option.value === event.target.value)
        this.setState({ checkedValue: checked });
        this.props.onChange(checked);
    };

    onTextChange(event, valueIndex) {
        const {textValues, checkedValue} = this.state;
        const newOptionInfo = textValues.find(option => option.key === valueIndex);
        const newTextValues = textValues.filter(option => option.key !== valueIndex);
        newOptionInfo.text = event.target.value;
        newTextValues.push(newOptionInfo);
        if (checkedValue && checkedValue.value === newOptionInfo.value) {
            this.setState(
                {
                    textValues: newTextValues,
                    checkedValue: newOptionInfo
                }
            );
            this.props.onChange(newOptionInfo);
        }
        else this.setState({textValues: newTextValues});
    }


    componentDidMount() {
        let textValues = [];
        this.props.options.forEach((option, index) =>
            textValues.push(
                {
                    'value': option.value,
                    'text': option.allowText ? '' : null,
                    'key': index
                }
            )
        );
        this.setState({ textValues, checkedValue: this.props.defaultValue });
    }



    render() {
        const {state, disabled, defaultValue, options, classes} = this.props;
        const {checkedValue} = this.state;
        const isDisabledField = isDisabled(state) || disabled;
        return (
            <RadioGroup row
                disabled={isDisabledField}
                defaultValue={defaultValue && defaultValue.value}
                onChange={this.handleChange}
            >
                {options.map((option, index) =>
                    <FormControlLabel
                        disabled={isDisabledField}
                        key={index}
                        value={option.value}
                        control={<Radio classes={{root: classes.radio, checked: classes.checked}}/>}
                        label={option.allowText ?

                            <TextField className={classes.textField}
                                disabled={isDisabledField ||
                                             !(checkedValue && checkedValue.value === option.value)}
                                id="standard-bare"
                                label={option.label}
                                inputRef={(ref) => { this.input = ref; }}
                                margin="normal"
                                defaultValue={defaultValue &&
                                          (defaultValue.value === option.value ? defaultValue.text : '')}
                                onChange={(event) => this.onTextChange(event, index)}
                                InputLabelProps={{classes: {root: classes.textLabel}}}
                            /> :
                            option.label}
                    />)
                }
            </RadioGroup>
        );
    }
}

export default withStyles(styles)(OtherRadioGroup);