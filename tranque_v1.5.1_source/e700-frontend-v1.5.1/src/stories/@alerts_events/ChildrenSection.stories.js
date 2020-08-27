import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import ChildrenSection from '@alerts_events/components/ticket/detail/ChildrenSection';
import {getTicket} from './data/Ticket';
import { A, B, C, D, YELLOW_ALERT, RED_ALERT, CLOSED } from '@alerts_events/constants/ticketGroups';
import moment from 'moment';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};



const children = {
    archived: false,
    base_module: "ef.m1.level2.deslizamiento-menor",
    close_conditions: [
        {complete: true, description: "", short_description: ""},
        {complete: false, description: "", short_description: ""},
        {complete: false, description: "", short_description: ""},
    ],
    created_at: moment(),
    evaluable: true,
    id: "w9w5ffEPUhyZb6Wjoy-0xA",
    module: "_.ef.m1.level2.deslizamiento-menor",
    module_name: "Deslizamiento superficial de un sector del talud del muro",
    name: "Deslizamiento superficial de un sector del talud del muro",
    result_state: {level: 2, message: "Deslizamiento superficial de un sector del talud del muro",
        short_message: "Deslizamiento superficial de un sector del talud del muro"},
    spread_object: null,
    state: "B",
    target: "el-mauro",
    updated_at: moment()
};

function getChild(state, level) {
    return {...children, state: state, result_state: {level: level, message: '', short_message: ''}};
}



storiesOf('Alerts&Events/ticket-detail/ChildrenSection', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => (<div style={divStyle}>
        <ChildrenSection ticket={getTicket({children: [getChild(A, 1),
            getChild(B, 2),
            getChild(C, 3),
            getChild(D, 4),
            getChild(YELLOW_ALERT, 5),
            getChild(RED_ALERT, 6)]
        })
        }/>
    </div>))
    .add('No children', () => (<div style={divStyle}>
        <ChildrenSection ticket={getTicket({children: []})}/>
    </div>))
    .add('With closed children', () => (<div style={divStyle}>
        <ChildrenSection ticket={getTicket({children: [getChild(CLOSED, 1),
            getChild(CLOSED, 2),
            getChild(CLOSED, 3),
            getChild(CLOSED, 4),
            getChild(CLOSED, 5),
            getChild(CLOSED, 6)]
        })
        }/>
    </div>))

