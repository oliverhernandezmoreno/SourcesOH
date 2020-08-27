import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
// import goal from '@e700/assets/goal.png';
import goal from '@e700/assets/goal-b-w.png';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import {withStyles} from '@material-ui/core';

const styles = theme => ({
    text: {
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '400',
        letterSpacing: '0.5px',
        lineHeight: '28px'
    },
    subtext: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '400',
        letterSpacing: '0.25px',
        lineHeight: '20px',
        textAlign: 'center'
    },
    img: {
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '20px',
        marginBottom: '30px',
        size: 'small'
    },
    card: {
        marginBottom: theme.spacing(4)
    },
    notInformedFields: {
        marginBottom: theme.spacing(4),
        backgroundColor: theme.palette.primary.main
    },
    infoLabel: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '400',
        letterSpacing: '0.25px',
        lineHeight: '20px'
    },
    stepWrapper: {
        marginBottom: theme.spacing(1),
        width: '300px'
    },
    stepLabel: {
        fontSize: '14px',
        fontWeight: '400',
        letterSpacing: '0.25px',
        lineHeight: '20px',
        textAlign: 'left',
        marginBottom: theme.spacing(0.5)
    },
    sectionWrapper: {
        marginBottom: theme.spacing(1),
        // marginLeft: theme.spacing(0.5),
        color: '#ffffff'
    },
    sectionLabel: {
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '400',
        letterSpacing: '0.4px',
        lineHeight: '16px',
        textAlign: 'left',
        marginBottom: theme.spacing(0.5)
    },
    fieldWrapper: {
        marginBottom: theme.spacing(0.5)
    },
    fieldLabel: {
        color: '#FF6549',
        fontSize: '12px',
        fontWeight: '400',
        letterSpacing: '0.4px',
        lineHeight: '16px'
    },
    notInformedTitle: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    }
});

class COmittedFields extends Component {
    getField(field, index2, title) {
        const {answers, classes} = this.props;
        let message = field.label;
        let isFilled = answers[field.key];
        switch (field.type) {
            case 'text': break;
            case 'select': break;
            case 'radio':
                message = "Sin opción seleccionada";
                break;
            case 'table':
                const labelColumns = field.columns.filter(col => col.type==='label').length || 0;
                const rows = field.columns.find(col => col.type==='label').values.length;
                const columns = field.columns.length;
                const cells = rows * (columns - labelColumns);
                const answered = answers[field.key] ? Object.keys(answers[field.key]).length : 0;
                message = "Faltan " + (cells - answered) + " de " + (cells) + " datos en la tabla";
                isFilled = answered === cells;
                break;
            default:
        }
        return isFilled ? null :
            <Box key={index2} display="flex" alignItems="center" className={classes.fieldWrapper}>
                <KeyboardArrowRight/>
                <Typography className={classes.fieldLabel}>
                    {message}
                </Typography>
            </Box>;
    }

    getSection(e, index1) {
        const fields = e.fields.map((f, index2) => this.getField(f, index2))
            .filter(s => s !== null);
        if (fields.length > 0) {
            return (
                <Box key={index1} flexDirection="column" className={this.props.classes.sectionWrapper}>
                    <Typography className={this.props.classes.sectionLabel}>{e.title}</Typography>
                    {fields}
                </Box>
            );
        }
        return null;
    }

    getStep(s, index) {
        const sections = s.sections
            .map((e, index1) => this.getSection(e, index1))
            .filter(s => s !== null);
        if (sections.length > 0) {
            return (
                <Box key={index} flexDirection="column" alignItems="center" className={this.props.classes.stepWrapper}>
                    <Typography className={this.props.classes.stepLabel}>{s.title}</Typography>
                    {sections}
                </Box>
            );
        }
        return null;
    }

    getAnnexes() {
        const {documents, newFiles} = this.props;
        const labels = {
            'anexo1': 'Anexo 1',
            'anexo2': 'Anexo 2',
            'anexo3': 'Anexo 3'
        };
        let annexes = Object.keys(labels);
        documents.forEach(d => {
            if (d.meta.annex) {
                annexes = annexes.filter(a => a !== d.meta.annex.value);
            }
        });

        const newAnnexes = Object.keys(newFiles);
        annexes = annexes.filter(a => !newAnnexes.includes(a));
        if (annexes.length > 0) {
            return (
                <div key='annexes' className={this.props.classes.stepWrapper}>
                    <Typography className={this.props.classes.stepLabel}>Anexos</Typography>
                    {annexes.map((a, index) =>
                        <div key={index} className={this.props.classes.sectionWrapper}>
                            <Typography className={this.props.classes.sectionLabel}>{labels[a]}</Typography>
                            <Box display="flex" alignItems="center" className={this.props.classes.fieldWrapper}>
                                <KeyboardArrowRight/>
                                <Typography className={this.props.classes.fieldLabel}>No se adjuntaron
                                    anexos</Typography>
                            </Box>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    }

    render() {
        const {schema} = this.props;

        const noAnswers = schema.steps
            .map((s, index) => this.getStep(s, index));
        noAnswers.push(this.getAnnexes());
        return noAnswers.filter(s => s !== null);
    }
}

export const OmittedFields = withStyles(styles)(COmittedFields);

class FormInstanceDispatch extends Component {

    render() {
        const {schema, answers, classes, documents, newFiles} = this.props;

        return (
            <Container maxWidth="md">
                <Typography className={classes.text}>
                    Bien ¡Ya casi terminas!
                </Typography>
                <Typography className={classes.subtext}>
                    Llenaste el formulario E700, solo falta enviarlo.
                </Typography>
                <img src={goal} alt="Última etapa" height="170" width="170" className={classes.img}/>
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.card}>
                    <KeyboardArrowRight/>
                    <Typography display="inline" className={classes.infoLabel}>
                        Puedes hacer una revisión antes de enviarlo a SERNAGEOMIN. A continuación encontrarás una lista
                        de los parámetros no informados:
                    </Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" className={classes.notInformedFields}>
                    <Typography className={classes.notInformedTitle}>
                        Los siguientes campos no fueron informados:
                    </Typography>
                    <OmittedFields schema={schema} answers={answers} documents={documents} newFiles={newFiles}/>
                </Box>
            </Container>
        );
    }
}

export default withStyles(styles)(FormInstanceDispatch);
