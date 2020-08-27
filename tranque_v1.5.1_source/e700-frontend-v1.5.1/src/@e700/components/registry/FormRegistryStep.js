/*
This class is to show the form structure from backend, specifically from
e700-session endpoint
*/
import React, {Component} from 'react';
import {TextField, Select, Card, Grid, InputLabel, Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import theme from '@e700/theme';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import OtherRadioGroup from '@e700/components/inputs/OtherRadioGroup';


const styles = theme => ({
    sectionTitle: {
        fontSize: '20px'
    },
    card: {
        padding: '30px',
        textAlign: 'left',
    },
    formText: {
        width: '80%'
    },
    fields: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: '5px'
    },
    titles: {
        marginBottom: '40px',
    },
    label: {
        marginRight: '5px',
    },
    suffix: {
        marginLeft: '5px',
    },
    input: {
        padding: '8px 10px',
    },
    inputSuffix: {
        textAlign: 'left',
        padding: '15px'
    },
    divInput: {
        display: 'contents'
    },
    readOnly: {
        color: "#ffffff",
    },
    outlinedInput: {
        '& .MuiOutlinedInput-root': {
            '&.Mui-error fieldset': {
                borderColor: theme.palette.error.main
            }
        }
    },
    helperAlign: {
        marginBottom: 19
    },
    notFilledRadio: {
        // color: theme.palette.error.main,
        paddingLeft: 10,
        paddingBottom: 11
    }
});

class FormRegistryStep extends Component {

    getField(field) {
        const {classes, answers} = this.props;
        switch (field.type) {
            case 'text':
                return <Grid item xs={12} sm={6} className={classes.fields} key={field.key}>
                    <div className={classes.divInput}>
                        <TextField
                            disabled
                            error={!answers[field.key]}
                            label={field.label}
                            defaultValue={answers[field.key]}
                            className={classes.formText}
                            helperText={!answers[field.key] ? "Campo no informado" : ''}
                            InputProps={{ classes: { disabled: classes.readOnly } }}
                        />
                        <InputLabel className={classes.inputSuffix}>{field.suffix}</InputLabel>
                    </div>
                </Grid>;
            case 'select':
                return <Grid item xs={6} className={classes.fields} key={field.key}>
                    <Select className={classes.form}/>
                </Grid>;
            case 'radio':
                return <Grid item xs={12} className={classes.fields} key={field.key}>
                    <OtherRadioGroup disabled
                        defaultValue={answers[field.key]}
                        options={field.options}
                    />
                    {!answers[field.key] ?
                        <Typography className={classes.notFilledRadio} variant='caption'>
                            Sin opción seleccionada
                        </Typography> : ''}
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
        const {answers, classes} = this.props;
        const columns = field.columns.map((col) => ({title: col.header, field: col.header}));
        const data = field.columns.find(o => o.type === 'label').values.map((item, valIndex) => {
            let row = {};
            field.columns.map((col, index) => {
                row[col.header] = ( col.type === 'label' ? col.values[valIndex] :
                    (<div className={(answers[field.key] || {})[`${valIndex}-${index}`] && classes.helperAlign}>
                        <TextField
                            disabled
                            error={!(answers[field.key] || {})[`${valIndex}-${index}`]}
                            variant="outlined"
                            InputProps={{ classes: { input: classes.input, disabled: classes.readOnly } }}
                            classes={{ root: classes.outlinedInput }}
                            defaultValue={(answers[field.key] || {})[`${valIndex}-${index}`]}
                            helperText={!(answers[field.key] || {})[`${valIndex}-${index}`] ? "Campo no informado": ''}
                        />
                    </div>  )
                );
                return null;}
            );
            return row;
        });
        return (<TMaterialTable
            data={data}
            columns={columns}
            options={{toolbar: false, paging: false, sorting: false,
                headerStyle: { fontWeight: 'bold',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.secondary.light } }}
            localization={{body: {emptyDataSourceMessage: 'No hay campos disponibles'}}}
        />);
    }



    render() {
        const {classes, sections} = this.props;
        return (<div>
            <Card className={classes.card}>
                {sections.map((section, index) => {
                    return <Grid container direction="row" alignItems="stretch" spacing={3}
                        key={`${index}${section.title}`}
                        className={classes.titles}>
                        <Grid item xs={12} className={classes.sectionTitle}><strong>{section.title}</strong></Grid>
                        {(section.fields || []).map(field => {
                            return this.getField(field);
                        })}
                    </Grid>;
                }
                )}
            </Card>
        </div>
        );
    }
}

export default withStyles(styles)(FormRegistryStep);
