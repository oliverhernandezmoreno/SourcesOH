import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import * as EtlService from '@app/services/backend/etl';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';

import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import Typography from '@material-ui/core/Typography';
import StepButton from '@material-ui/core/StepButton';
import StepLabel from '@material-ui/core/StepLabel';

import InspectionVoucher from '@miners/components/EF/InspectionVoucher';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as Steps from '@miners/components/EF/InspectSteps';

const styles = theme => ({

    root: {
        width: '100%',
        height:100
    },

    titleText:{
        fontSize:20,
        marginLeft:"2rem",
        marginBottom:"20px",
        fontWeight:"bold"
    },

    button: {
        marginRight: theme.spacing(1),
    },

    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        top:0
    },

    footer: {
        height: '100px',
        display:"flex",
        alignItems:"center"
    },

    subFooter:{
        display:"inline",
        margin:"5px"
    },

    arrows: {
        color: '#2664AD'
    },

    textButton:{
        color: '#FFFFFF',
    },

    buttonFooter:{
        backgroundColor:'#1A76D1'
    },

    buttonSecundary: {
        color: '#1A76D1',
        border: '1px solid #1A76D1',
        fontWeight:'bold'
    },

    progress:{
        color: 'white',
        marginTop: '2rem',
        marginLeft: '40rem'
    },

    loadingContainer: {
        textAlign: 'center'
    },

    loading: {
        color: 'whiteSmoke',
        marginTop: '1rem'
    },

    stepper: {
        backgroundColor:"#161719"
    },
});

class InspectStepper extends SubscribedComponent{
        state = {
            activeStep: 0,
            events:[],
            operation:null,
            sendData: false,
            receptionData:true,
        }

  renderLoading = () => {
      const {classes} = this.props;
      return (
          <div className={classes.loadingContainer}>
              <CircularProgress className={classes.loading}/>
          </div>
      );
  };

  getSteps = () => {
      return ['Eventos', 'Desviaciones de diseño', 'Validación','Comprobante']}

  handleStep = step => () => {
      const steps = this.props.activeStep
      this.setState({steps});
  }

  handleNext = () => {
      const step = this.state.activeStep;
      const steps = step + 1;
      this.setState({activeStep: steps})
      document.getElementById("scrolled-content").scrollTop = 0;
  }

  handleBack = () => {
      const step = this.state.activeStep
      const steps = step - 1;
      this.setState({activeStep: steps})
      document.getElementById("scrolled-content").scrollTop = 0;
  };

  handleReset = () => {
      const {stateReset} = this.props;
      const step = 0
      this.setState({
          activeStep: step,
      })
      stateReset();
      document.getElementById("scrolled-content").scrollTop = 0;
  };

  handleChangeGroups = (group, name) => event => {
      if(group === "m1-triggers"){
          const triggers = {...this.props.triggers};
          triggers.answersTriggers[name]= event.target.checked;
          this.setState({triggers:triggers})
      }
      else if(group === "m1-important-triggers"){
          const triggers = {...this.props.triggers};
          triggers.answersTriggersImportant[name]= event.target.checked;
          this.setState({triggers:triggers})
      }
      else if(group === "m1-critical-triggers"){
          const triggers = {...this.props.triggers};
          triggers.answersTriggersCritical[name]= event.target.checked;
          this.setState({triggers:triggers})
      }
      else if(group === "m1-forecasts-triggers"){
          const triggers = {...this.props.triggers};
          triggers.answersTriggersForecasts[name]= event.target.checked;
          this.setState({triggers:triggers})
      }
      else if(group === "m1-design"){
          const design = {...this.props.design};
          design.answersDesign[name]= event.target.checked;
          this.setState({design:design})
      }
  };

  handleAnswer = (items, answers) => {
      const arrayAnswers = this.state.events;
      items.forEach(item => {
          const key = item.canonical_name;
          if (answers[key]!== undefined){
              arrayAnswers.push({
                  name: key, value: item.choices[+!answers[key]].value.choiceValue
              })
          }
      });
      this.setState({events: arrayAnswers})
  };

  handleSend = (props) => {
      const {target} = this.props;
      const {events} = this.state;
      this.setState({startSendData: true})

      this.subscribe(
          EtlService.createImmediately({
              target: target,
              executor:"direct:triggers-and-design",
              context:{events}
          }),(response) => {
              if(response.finished === true){
                  this.setState({sendData:true, operation:response.id});
                  this.handleNext();
              }else{
                  this.setState({receptionData:false})
              }
          }
      )
  }

  render(){
      const {triggers,design,target,loading,classes} = this.props;
      const {activeStep,startSendData,sendData,receptionData,operation}= this.state;
      const steps = this.getSteps();
      const TITLE = "Ingreso inspección diaria";

      return(
          <div className={classes.root} >
              <Typography className={classes.titleText}>
                  {TITLE}
              </Typography>
              <Paper style={{margin:"20px"}}>
                  <Stepper alternativeLabel activeStep={activeStep} className={classes.stepper}>
                      {steps.map((label, index) => {
                          const props = {};
                          const buttonProps = {};
                          const completed = sendData && index < 3
                          return (
                              <Step key={label} {...props} completed={completed}>
                                  {completed? <StepLabel>
                                      {label}
                                  </StepLabel>:
                                      <StepButton
                                          onClick={this.handleStep(index)}
                                          completed={completed}
                                          {...buttonProps}>
                                          {label}
                                      </StepButton>}
                              </Step>
                          );
                      })}
                  </Stepper>
              </Paper>
              <div>
                  {activeStep === 0 ?
                      loading ? this.renderLoading():
                          <Steps.renderTriggers
                              triggers={triggers}
                              handleChangeGroups={this.handleChangeGroups}
                              handleAnswer={this.handleAnswer}
                              handleNext={this.handleNext}
                              handleReset={this.handleReset}
                              classes={this.props.classes}/>: null}
                  {activeStep === 1?
                      loading ? this.renderLoading():
                          <Steps.renderDesign
                              design={design}
                              handleChangeGroups={this.handleChangeGroups}
                              handleAnswer={this.handleAnswer}
                              handleNext={this.handleNext}
                              handleReset={this.handleReset}
                              handleBack={this.handleBack}
                              classes={this.props.classes}/>: null}

                  {activeStep === 2?
                      loading ? this.renderLoading():
                          <Steps.renderAnswerTable
                              triggers={triggers}
                              design={design}
                              startSendData={startSendData}
                              sendData={sendData}
                              receptionData={receptionData}
                              handleSend={this.handleSend}
                              handleReset={this.handleReset}
                              handleBack={this.handleBack}
                              classes={this.props.classes}/>: null}

                  {activeStep === 3?
                      loading ? this.renderLoading():
                          <InspectionVoucher
                              target={target}
                              operation={operation}/>: null}

              </div>
          </div>
      );
  }
}

InspectStepper.propTypes = {
    classes: PropTypes.object.isRequired,
    loading: PropTypes.bool
};

export default withStyles(styles)(InspectStepper);
