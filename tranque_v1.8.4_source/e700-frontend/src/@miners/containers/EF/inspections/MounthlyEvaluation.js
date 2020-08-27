import React,{Component} from 'react';
import StepperMounthly from '@miners/containers/EF/inspections/StepperMounthly'

class MounthlyEvaluation extends Component{
    render(){
        const target = this.props.match.params.target;
        return(
            <StepperMounthly target={target}/>
        );
    }
}

export default MounthlyEvaluation;
