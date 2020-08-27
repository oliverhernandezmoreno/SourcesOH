import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as timeseriesService from '@app/services/backend/timeseries';
import * as EtlService from '@app/services/backend/etl';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import StepButton from '@material-ui/core/StepButton';
import InspectionVoucher from '@miners/components/EF/InspectionVoucher';
import {sortByCategory} from '@app/services/backend/timeseries';

import { GroupRadios } from '@miners/components/EF/RadioButtonGroup';
import AnswerTable from '@miners/components/EF/AnswerTable';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
    root: {
        width: '100%',
        height:100
    },

    stepper: {
        backgroundColor:"#161719"
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

    buttonSecundary: {
        color: '#1A76D1',
        border: '1px solid #1A76D1',
        fontWeight:'bold'
    },

    instructions: {
        marginLeft:"10px"
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
        color: '#FFFFFF'
    },

    buttonFooter:{
        backgroundColor:'#1A76D1'
    },

    progress:{
        color: 'white',
        marginTop: '2rem',
        marginLeft: '40rem'
    },

    loading: {
        color: 'white',
        marginTop: '1rem',
        marginLeft: '38rem',
        marginBottom:'1rem'
    }
});


class StepperMounthly extends SubscribedComponent {
  state = {
      activeStep: 0,
      answersVulnerabilityI:[],
      answersVulnerabilityII:[],
      itemsVulnerabilityI:[],
      superItemVulnerability: null,
      events:[],
      checkStepper: false,
      loading: true,
      sendData: false,
      operation:null,
      startSendData: false,
      receptionData: true,
      reset: false
  }

  //load m1 - vulnerability and m1-vulnerability-final-question
  componentDidMount(){
      this.loadData();
  }

  componentDidUpdate(prevProps,prevState){
      if (prevState.reset !== this.state.reset) {
          this.loadData();
          this.setState({reset: false})
      }
  }

loadData=()=>{
    this.subscribe(
        timeseriesService.list({
            target: this.props.target,
            template_category: "m1-vulnerability",
        }),
        (tss) => {
            const orderedList = sortByCategory(tss);
            orderedList.slice(0,-1).map((obj) => //Slice
                this.setState({answersVulnerabilityI:{...this.state.answersVulnerabilityI,
                    [obj.canonical_name]: undefined}}))
            this.setState({itemsVulnerabilityI: orderedList.slice(0,-1)}); //Last element not considered
        }
    );

    this.subscribe(
        timeseriesService.list({
            target: this.props.target,
            template_category: "m1-vulnerability-final-question",
        }),
        (tss) => {
            const orderedList = tss;
            orderedList.map((obj) =>
                this.setState({answersVulnerabilityII:{...this.state.answersVulnerabilityII,
                    [obj.canonical_name]: undefined}}))
            this.setState({superItemVulnerability: orderedList,
                loading:false});
        }
    );
}

// Loading
renderLoading() {
    const {classes} = this.props;
    return (
        <div className={classes.loadingContainer}>
            <CircularProgress className={classes.loading}/>
        </div>
    );
};

  // Stepper function
  getSteps = () => {
      return ['Paso 1', 'Paso 2', 'Validación','Comprobante'];
  }

  handleNext = () => {
      this.setState({activeStep: this.state.activeStep + 1})
  }

  handleBack = () => {
      this.setState({activeStep: this.state.activeStep - 1})
  }

  handleStep = step => () => {
      this.setState({
          activeStep: step
      });
  };

  handleReset = () => {
      this.setState({
          activeStep: 0,
          reset:true
      })
  };

  handleChangeVulnerabilityI = (name) => event => {
      this.setState({answersVulnerabilityI:
        {...this.state.answersVulnerabilityI, [name]: event.target.value}})
  };

  handleChangeVulnerabilityII = (name) => event => {
      this.setState({answersVulnerabilityII:
        {...this.state.answersVulnerabilityII, [name]: event.target.value}})
  };

  handleAnswer = (items, answers) => {
      const arrayAnswers = [...this.state.events];
      items.forEach(item => {
          const key = item.canonical_name;
          if (answers[key]!== undefined) {
              arrayAnswers.push({
                  name: item.canonical_name,
                  value: parseFloat(answers[item.canonical_name])
              })
          }
      });
      this.setState({events: arrayAnswers});
  }

  handleSend = (props) => {
      const {events} = this.state;
      this.setState({startSendData: true})

      this.subscribe(
          EtlService.createImmediately({
              target: this.props.target,
              executor:"direct:vulnerability",
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

  renderGroupRadios=(checkStepper)=>{
      const{classes} = this.props;
      const subTitle = "Evaluación de vulnerabilidad física del depósito de relaves: "
      const{loading}= this.state;
      const saveAndContinue="Guardar y continuar";
      const cancelOption ="Cancelar";
      return(
          <div>
              <Typography className={classes.titleText}>
                  {subTitle}
              </Typography>
              {loading ? this.renderLoading():
                  <div>
                      <div className={classes.instructions}>
                          <div>
                              <GroupRadios
                                  items={this.state.itemsVulnerabilityI}
                                  answers={this.state.answersVulnerabilityI}
                                  handleChange={this.handleChangeVulnerabilityI}
                              />
                          </div>
                      </div>
                      <div className={classes.footer}>
                          <div className={classes.subFooter}>
                              <Button
                                  onClick={this.handleReset}
                                  className={classes.buttonSecundary}>
                                  <Typography>{cancelOption}</Typography>
                              </Button>
                          </div>
                          <div className={classes.subFooter}>
                              <Button
                                  variant="contained"
                                  disabled={!checkStepper}
                                  onClick={() => {this.handleNext();
                                      this.handleAnswer(this.state.itemsVulnerabilityI,
                                          this.state.answersVulnerabilityI)}}
                                  className={classes.buttonFooter}>
                                  <Typography className={classes.textButton}>{saveAndContinue}</Typography>
                              </Button>
                          </div>
                      </div>
                  </div>}
          </div>
      );
  }

  renderRadio=(checkStepper)=>{
      const{classes} = this.props;
      const MSNTITLE = "Evaluación de vulnerabilidad física del depósito de relaves: "
      const saveAndContinue="Guardar y continuar";
      const cancelOption ="Cancelar";
      const goBack = "Volver";
      return(
          <div>
              <Typography className={classes.titleText}>
                  {MSNTITLE}
              </Typography>
              <div className={classes.instructions}>
                  <div>
                      <GroupRadios
                          items={this.state.superItemVulnerability}
                          answers={this.state.answersVulnerabilityII}
                          handleChange={this.handleChangeVulnerabilityII}
                      />
                  </div>
              </div>
              <div className={classes.footer}>
                  <div className={classes.subFooter}>
                      <Button
                          onClick={this.handleReset}
                          className={classes.buttonSecundary}>
                          <Typography>{cancelOption}</Typography>
                      </Button>
                  </div>
                  <div className={classes.subFooter}>
                      <Button
                          onClick={this.handleBack}
                          className={classes.buttonSecundary}>
                          <Typography>{goBack}</Typography>
                      </Button>
                  </div>
                  <div className={classes.subFooter}>
                      <Button
                          variant="contained"
                          disabled={!checkStepper}
                          onClick={() => {this.handleNext();
                              this.handleAnswer(this.state.superItemVulnerability,
                                  this.state.answersVulnerabilityII)}}
                          className={classes.buttonFooter}>
                          <Typography className={classes.textButton}>{saveAndContinue}</Typography>
                      </Button>
                  </div>
              </div>
          </div>
      );
  }

renderAnswerTable= () => {
    const{classes} = this.props;
    const{sendData,startSendData} = this.state;
    const sendInformation="Envia Información";
    const cancelOption ="Cancelar";
    const goBack = "Volver";
    return(
        <div>
            <div className={classes.instructions}>
                <div>
                    <AnswerTable
                        items={this.state.superItemVulnerability}
                        answers={this.state.answersVulnerabilityII}
                        group ={"Funcionamiento"}
                        daily={false}/>
                    <AnswerTable
                        items={this.state.itemsVulnerabilityI}
                        answers={this.state.answersVulnerabilityI}
                        group ={"Vulnerabilidad"}
                        daily={false}/>
                </div>
            </div>
            <div className={classes.footer}>
                <div className={classes.subFooter}>
                    <Button
                        onClick={this.handleReset}
                        className={classes.buttonSecundary}>
                        <Typography>{cancelOption}</Typography>
                    </Button>
                </div>
                {!sendData ?
                    <div className={classes.subFooter}>
                        <Button
                            onClick={this.handleBack}
                            className={classes.buttonSecundary}>
                            <Typography>{goBack}</Typography>
                        </Button>
                    </div>: null}
                <div className={classes.subFooter}>
                    <Button
                        variant="contained"
                        onClick={() => {this.handleSend()}}
                        className={classes.buttonFooter}>
                        <Typography className={classes.textButton}>{sendInformation}</Typography>
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

renderVoucher = () => {

    return <InspectionVoucher target={this.props.target} operation={this.state.operation} />;
}
render(){
    const {classes} = this.props;
    const steps = this.getSteps();
    const {activeStep, answersVulnerabilityI, answersVulnerabilityII} = this.state;
    let {checkStepper} = this.state;
    const TITLEPAGE = "Ingreso evaluación mensual"

    switch (this.state.activeStep){
        case 0:
            let countI = 0;
            Object.keys(answersVulnerabilityI).forEach((key) =>
            { if(answersVulnerabilityI[key] !== undefined){countI += 1}})
            checkStepper = Object.keys(answersVulnerabilityI).length === countI
            break
        case 1:
            let countII = 0;
            Object.keys(answersVulnerabilityII).forEach((key) =>
            { if(answersVulnerabilityII[key] !== undefined){countII += 1}})
            checkStepper = Object.keys(answersVulnerabilityII).length === countII
            break
        default:

    }
    return (
        <div className={classes.root}>
            <Typography className={classes.titleText}>
                {TITLEPAGE}
            </Typography>
            <Stepper alternativeLabel nonLinear activeStep={activeStep} className={classes.stepper}>
                {steps.map((label, index) => {
                    const props = {};
                    const buttonProps = {};
                    const completed = this.state.sendData && index < 3
                    return (
                        <Step key={label} {...props} completed={completed}>
                            {completed? <StepLabel>{label}</StepLabel>:
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
            <div>
                {activeStep === 0 ? this.renderGroupRadios(checkStepper): null}
                {activeStep === 1 ? this.renderRadio(checkStepper): null}
                {activeStep === 2 ? this.renderAnswerTable(): null}
                {activeStep === 3 ? this.renderVoucher(): null}
            </div>
        </div>
    );
}
}

StepperMounthly.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StepperMounthly);
