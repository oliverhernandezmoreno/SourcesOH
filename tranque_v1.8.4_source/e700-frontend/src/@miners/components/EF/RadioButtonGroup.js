import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';

const useStyles = makeStyles({
    root: {
        '&:hover': {
            backgroundColor: 'transparen',
        },
    },
    icon: {
        borderRadius: '50%',
        width: 16,
        height: 16,
        boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
        backgroundColor: '#f5f8fa',
        backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
        '$root.Mui-focusVisible &': {
            outline: '2px auto rgba(19,124,189,.6)',
            outlineOffset: 2,
        },
        'input:hover ~ &': {
            backgroundColor: '#ebf1f5',
        },
        'input:disabled ~ &': {
            boxShadow: 'none',
            background: 'rgba(206,217,224,.5)',
        },
    },
    checkedIcon: {
        backgroundColor: '#137cbd',
        backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
        '&:before': {
            display: 'block',
            width: 16,
            height: 16,
            backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
            content: '""',
        },
        'input:hover ~ &': {
            backgroundColor: '#106ba3',
        },
    },
    radioGroup:{
        marginLeft:"50px",
        marginTop:"30px"
    }
});

export const StyledRadio = (props) => {
    const classes = useStyles();
    return (
        <Radio
            className={classes.root}
            color="default"
            checkedIcon={<span className={classNames(classes.icon, classes.checkedIcon)}/>}
            icon={<span className={classes.icon} />}
            {...props}
        />
    );
}

export const GroupRadios = (props) => {
    const{items, answers, handleChange} = props;
    const classes = useStyles();
    return (
        <div>
            {items.map((values,id) =>
                <div key={id} className={classes.radioGroup}>
                    {(values.template_name === "ef-mvp.m1.vulnerability.vulnerabilidad")?
                        <FormLabel component="div">{values.description}</FormLabel>:
                        <FormLabel component="div">{values.name}</FormLabel>
                    }

                    <RadioGroup key={id}
                        aria-label="gender"
                        value={answers[values.canonical_name] || ''}
                        onChange={handleChange(values.canonical_name)}>
                        {values.choices.map((answer,id) =>
                            <FormControlLabel
                                key={id}
                                value={answer.value.choiceValue.toString()}
                                control={<StyledRadio />}
                                label={answer.choice} />
                        )}
                    </RadioGroup>
                </div>
            )}
        </div>
    );
}
