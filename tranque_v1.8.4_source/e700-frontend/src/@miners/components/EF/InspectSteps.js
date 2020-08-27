import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardSwitchGroup from '@miners/components/EF/CardSwitchGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import AnswerTable from '@miners/components/EF/AnswerTable';
import CardAlertMessage from '@miners/components/EF/CardAlertMessage';

export const renderTriggers = (props) => {
    const{triggers,
        handleChangeGroups,
        handleChangeEvents,
        handleAnswer,
        handleNext,
        handleReset,
        classes} = props;

    return(
        <div>
            <div className={classes.instructions}>
                <div>
                    <CardSwitchGroup
                        group={"m1-critical-triggers"}
                        items={triggers.itemsTriggersCritical}
                        answers={triggers.answersTriggersCritical}
                        answersEvents={triggers.answersTriggersEvents}
                        handleChange={handleChangeGroups}
                        handleChangeEvents={handleChangeEvents}/>

                    <CardSwitchGroup
                        group={"m1-important-triggers"}
                        items={triggers.itemsTriggersImportant}
                        answers={triggers.answersTriggersImportant}
                        handleChange={handleChangeGroups}/>

                    <CardSwitchGroup
                        group={"m1-triggers"}
                        items={triggers.itemsTriggers}
                        answers={triggers.answersTriggers}
                        answersEvents={triggers.answersTriggersEvents}
                        handleChange={handleChangeGroups}
                        handleChangeEvents={handleChangeEvents}/>

                    <CardSwitchGroup
                        group={"m1-forecasts-triggers"}
                        items={triggers.itemsTriggersForecasts}
                        answers={triggers.answersTriggersForecasts}
                        handleChange={handleChangeGroups}/>

                </div>
            </div>
            <div className={classes.footer}>
                <div className={classes.subFooter}>
                    <Button
                        onClick={handleReset}
                        className={classes.buttonSecundary}>
                        <Typography>Cancelar</Typography>
                    </Button>
                </div>
                <div className={classes.subFooter}>
                    <Button
                        variant="contained"
                        onClick={() => {handleNext();
                            handleAnswer(triggers.itemsTriggers,triggers.answersTriggers);
                            handleAnswer(triggers.itemsTriggers,triggers.answersTriggersEvents);
                            handleAnswer(triggers.itemsTriggersCritical,triggers.answersTriggersEvents);
                            handleAnswer(triggers.itemsTriggersCritical,triggers.answersTriggersCritical);
                            handleAnswer(triggers.itemsTriggersImportant,triggers.answersTriggersImportant);
                            handleAnswer(triggers.itemsTriggersForecasts,triggers.answersTriggersForecasts);
                        }}
                        className={classes.buttonFooter}>
                        <Typography className={classes.textButton}>Guardar y continuar</Typography>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export const renderDesign = (props) => {
    const{design,
        handleChangeGroups,
        handleAnswer,
        handleNext,
        handleBack,
        handleReset,
        classes}=props;

    return(
        <div>
            <div className={classes.instructions}>
                <div>
                    <CardSwitchGroup
                        group={"m1-design"}
                        items={design.itemsDesign}
                        answers={design.answersDesign}
                        handleChange={handleChangeGroups}/>
                </div>
            </div>
            <div className={classes.footer}>
                <div className={classes.subFooter}>
                    <Button
                        onClick={handleReset}
                        className={classes.buttonSecundary}>
                        <Typography>Cancelar</Typography>
                    </Button>
                </div>
                <div className={classes.subFooter}>
                    <Button
                        onClick={handleBack}
                        className={classes.buttonSecundary}>
                        <Typography>Volver</Typography>
                    </Button>
                </div>
                <div className={classes.subFooter}>
                    <Button
                        variant="contained"
                        onClick={() => {handleNext();
                            handleAnswer(design.itemsDesign,design.answersDesign);
                        }}
                        className={classes.buttonFooter}>
                        <Typography className={classes.textButton}>Guardar y continuar</Typography>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export const renderAnswerTable = (props) => {
    const{ triggers,
        design,
        startSendData,
        sendData,
        handleSend,
        handleReset,
        handleBack,
        receptionData,
        classes}=props;

    const renderAlertMessage = () => {
        const {classes}=this.props;
        return(
            <div className={classes.instructions}>
                <CardAlertMessage/>
            </div>
        );
    }

    return(
        <div>
            {!receptionData? renderAlertMessage():null}
            <div className={classes.instructions}>
                <AnswerTable
                    items={triggers.itemsTriggersCritical}
                    answers={triggers.answersTriggersCritical}
                    answersEvents={triggers.answersTriggersEvents}
                    group ={"eventos críticos"}
                    daily={true}/>
                <AnswerTable
                    items={triggers.itemsTriggersImportant}
                    answers={triggers.answersTriggersImportant}
                    group ={"eventos importantes"}
                    daily={true}/>
                <AnswerTable
                    items={triggers.itemsTriggers}
                    answers={triggers.answersTriggers}
                    answersEvents={triggers.answersTriggersEvents}
                    group ={"eventos"}
                    daily={true}/>
                <AnswerTable
                    items={triggers.itemsTriggersForecasts}
                    answers={triggers.answersTriggersForecasts}
                    group ={"pronóstico climatológico"}
                    daily={true}/>
                <AnswerTable
                    items={design.itemsDesign}
                    answers={design.answersDesign}
                    group ={"diseño"}
                    daily={true}/>
            </div>
            <div className={classes.footer}>
                <div className={classes.subFooter}>
                    <Button
                        onClick={handleReset}
                        className={classes.buttonSecundary}>
                        {(sendData)?
                            <Typography>Volver al Inicio</Typography>:
                            <Typography>Cancelar</Typography>}
                    </Button>
                </div>
                <div className={classes.subFooter}>
                    <Button
                        onClick={handleBack}
                        className={classes.buttonSecundary}>
                        <Typography>Volver</Typography>
                    </Button>
                </div>
                <div className={classes.subFooter}>
                    <Button
                        disabled={startSendData && sendData}
                        variant="contained"
                        onClick={handleSend}
                        className={classes.buttonFooter}>
                        <Typography className={classes.textButton}>Enviar información</Typography>:
                    </Button>
                </div>
                {startSendData?
                    <div className={classes.subFooter}>
                        <CircularProgress style={{marginLeft:"20px",color:"white"}}/>
                    </div>:null}
            </div>
        </div>
    );
}
