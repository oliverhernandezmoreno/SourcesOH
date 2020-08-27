/*
This class is to show the form structure from backend, specifically from
e700-session endpoint
*/
import React, {Component} from 'react';
import {TextField, Select, Card, Grid, InputLabel, SnackbarContent} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import OtherRadioGroup from '@e700/components/inputs/OtherRadioGroup';
import {validators as validatorImplementations} from '@app/services';
import {formatters as formatterImplementations} from '@app/services/formFormatters';
import {isDisabled} from '@e700/e700';
import {canEditForm} from '@e700/constants/userActions';

/*For style*/
const styles = theme => ({
    card: {
        padding: '30px',
        textAlign: 'left'
    },
    formText: {
        width: '100%',
    },
    fields: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: '5px'
    },
    titles: {
        marginBottom: '40px',
        color: '#ffffff'
    },
    label: {
        marginRight: '5px',
        color: 'rgba(0, 0, 0, 0.87)'
    },
    suffix: {
        marginLeft: '5px',
        color: 'rgba(0, 0, 0, 0.87)'
    },
    input: {
        padding: '8px 10px',
        color: '#ffffff'

    },
    inputSuffix: {
        textAlign: 'left',
        paddingLeft: '1px',
        paddingBottom: '17px'
    },
    divInput: {
        display: 'contents'
    },
    helperText: {
        color: '#c62828',
        fontSize: '12px',
    },
    snackbar: {
        margin: theme.spacing(1),
    },
    head: {
        backgroundColor: theme.palette.primary.main,
    },
    th: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#ffffff',
        padding: theme.spacing(1),
    },
    table: {
        width: '100%',
        display: 'block',
        overflow: 'auto'
    },
    labelCell: {
        paddingBottom: theme.spacing(2),
    }
});

class FormInstanceStep extends Component {
    constructor(props) {
        super(props);
        this.state = {
            answers: {},
            failingValidators: {}
        };
    }

    componentDidUpdate(prevProps){
        if (prevProps.sections !== this.props.sections){
            this.setState({
                failingValidators: {}
            });
            this.props.sections.forEach(section => {
                (section.fields || []).forEach(field => {
                    this.validateAnswer(field)({target:{value:this.props.answers[field.key]||''}})
                });
            });
        }
    }

    // TODO: Find the way to use Refs for apply formatted values in the input fields (pmerino)
    setValue(key, value) {
        var node = document.getElementById(key);
        if (node != null)
            node.value = value;
    }

    validateAnswer({key, validators}) {
        return (event) => {
            let value = event.target.value;
            // Only when the value is not empty, we need to apply the validator logic
            if (value && value.length !== 0) {
                let value_without_white_spaces = value.toString().replace(/ /g, "");
                let value_without_points = value_without_white_spaces.replace(/\./g, "");
                if ("[objectObject]".localeCompare(value_without_points) === 0)
                    value_without_points = "";
                const failingValidator = Object.entries(validators || {}).find(
                    ([name, param]) => {
                        if (name === "isNumber") {
                            // TODO: Find the way to use Refs for apply formatted values in the input fields (pmerino)
                            this.setValue(key, value_without_points);
                        }
                        let hasErrors = false;
                        if (typeof validatorImplementations[name] !== "function") {
                            console.warn("No validator available for", name);
                            return false;
                        }
                        hasErrors = !validatorImplementations[name](param)(value_without_points);
                        if (!hasErrors && name === "isNumber" && param) {
                            let value_formatted = formatterImplementations["thousandsSeparator"].forward(value_without_points);
                            // TODO: Find the way to use Refs for apply formatted values in the input fields (pmerino)
                            this.setValue(key, value_formatted);
                        }
                        return hasErrors;
                    }
                );
                if (failingValidator) {
                    const [validator, param] = failingValidator;
                    this.setState((state) => ({
                        ...state,
                        failingValidators: {
                            ...state.failingValidators,
                            [key]: validatorImplementations.MESSAGES[validator](param)
                        }
                    }), () => this.props.updateValidator(this.state.failingValidators));
                } else {
                    this.setState((state) => ({
                        ...state,
                        failingValidators: Object.entries(state.failingValidators)
                            .filter(([k, v]) => k !== key)
                            .reduce((acc, [k, v]) => ({...acc, [k]: v}), {})
                    }), () => this.props.updateValidator(this.state.failingValidators));
                }
            }
        };
    }

    loadAnswer(key) {
        return (event) => {
            this.props.updateAnswers(key, event.target.value);
        };
    }

    loadRadioAnswer(key) {
        return (answer) => {
            this.props.updateAnswers(key, answer);
        }
    }

    loadTableAnswer(key, index1, index2) {
        return (event) => {
            const tableAnswer = this.props.answers[key] || {};
            tableAnswer[`${index1}-${index2}`] = event.target.value;
            this.props.updateAnswers(key, tableAnswer);
        };
    }

    getField(field) {
        const failingValidators = this.state.failingValidators;
        const {answers, classes, user} = this.props;
        switch (field.type) {
            case 'text':
                return <Grid item xs={12} sm={6} className={classes.fields} key={field.key}>
                    <div className={classes.divInput}>
                        <TextField
                            // TODO: Find the way to use Refs for apply formatted values in the input fields (pmerino)
                            id={field.key}
                            label={field.label}
                            disabled={isDisabled(this.props.form.state, canEditForm(user))}
                            defaultValue={answers[field.key]}
                            className={classes.formText}
                            InputProps={{classes: {input: classes.input}}}
                            onChange={this.loadAnswer(field.key)}
                            onBlur={this.validateAnswer(field)}
                            helperText={<span
                                className={classes.helperText}>{failingValidators[field.key] || ' '}</span>}/>
                        <InputLabel className={classes.inputSuffix}>{field.suffix}</InputLabel>
                    </div>
                </Grid>;
            case 'select':
                return <Grid item xs={6} className={classes.fields} key={field.key}>
                    <Select className={classes.form} onChange={this.loadAnswer(field.key)}/>
                </Grid>;
            case 'radio':
                return <Grid item xs={12} className={classes.fields} key={field.key}>
                    <OtherRadioGroup
                        defaultValue={answers[field.key]}
                        onChange={this.loadRadioAnswer(field.key)}
                        options={field.options}
                        state={this.props.form.state}
                    />
                </Grid>;
            case 'table':
                return <Grid item xs={12} className={classes.fields} key={field.key}>
                    {this.renderTableField(field)}
                </Grid>;
            default:
                return '';
        }
    }


    renderTableField(field) {
        const failingValidators = this.state.failingValidators;
        const {answers, classes, form, user} = this.props;
        return (<div className={classes.table}>
            <table>
                <thead className={classes.head}>
                    <tr>
                        {field.columns.map((o, index) => <th className={classes.th}
                            key={index}>{o.header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {field.columns.find(o => o.type === 'label').values.map(
                        (val, index1) =>
                            <tr className={classes.mallas} key={`<tr>${field.key}-${index1}`}>
                                {field.columns.map(
                                    (o, index2) =>
                                        <td align="center" key={`<td>${field.key}-${index1}-${index2}`}>
                                            {o.type === 'label' ?
                                                <div className={classes.labelCell}>{o.values[index1]}</div> :
                                                <TextField
                                                    disabled={isDisabled(form.state, canEditForm(user))}
                                                    variant="outlined"
                                                    InputProps={{classes: {input: classes.input}}}
                                                    defaultValue={(answers[field.key] || {})[`${index1}-${index2}`]}
                                                    onChange={this.loadTableAnswer(field.key, index1, index2)}
                                                    onBlur={this.validateAnswer({key:`${field.key}-${index1}-${index2}`,
                                                        validators:o.validators})}
                                                    helperText={<span className={classes.helperText}>
                                                        {failingValidators[`${field.key}-${index1}-${index2}`] || ' '}
                                                    </span>}
                                                />
                                            }
                                        </td>
                                )}
                            </tr>
                    )}
                </tbody>
            </table>
        </div>);
    }


    render() {
        const {classes, sections} = this.props;
        return (
            <>
                <div>
                    <Card className={classes.card}>
                        {sections.map((section, index) => {
                            return <Grid container direction="row" alignItems="stretch" spacing={3}
                                key={`${index}${section.title}`}
                                className={classes.titles}>
                                <Grid item xs={12}><strong>{section.title}</strong></Grid>
                                {(section.fields || []).map(field => {
                                    return this.getField(field);
                                })}
                            </Grid>;
                        })}
                    </Card>
                </div>
                {/*Snackbar message*/}
                {Object.keys(this.state.failingValidators).length > 0 &&
                  <div>
                      <SnackbarContent
                          className={classes.snackbar}
                          message={
                              'Existen campos con formato erróneo. Reemplaza o elimina el contenido para el correcto envío del formulario'
                          }
                      />
                  </div>
                }
            </>
        );
    }
}

export default withStyles(styles)(FormInstanceStep);
