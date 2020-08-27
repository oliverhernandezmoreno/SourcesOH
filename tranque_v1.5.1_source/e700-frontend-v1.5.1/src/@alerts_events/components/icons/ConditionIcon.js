import React from 'react';
import { Check, Clear } from '@material-ui/icons';
import {COLORS} from '@miners/theme';



const ConditionIcon = ({state}) => {
    if (state) {
        return <Check style={{color: COLORS.states.success}}/>
    }
    else return <Clear color='error'/>
};

export default ConditionIcon;