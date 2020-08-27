import { event_states, alert_states } from '@alerts_events/constants/ticketGroups';
import { MIN_2, MIN_3, AUT_2, AUT_3 } from '@alerts_events/constants/profiles';


function getActions() {
    let actions = [];
    const levels = [MIN_2, MIN_3, AUT_2, AUT_3];
    // escalate
    event_states.forEach(state => {
        levels.forEach(level => {
            event_states.forEach(toState => {
                if (state !== toState) {
                    actions.push({
                        name: 'ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.request'}
                    );
                    actions.push({
                        name: 'ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.resolve'}
                    );
                    actions.push({
                        name: 'ticket.' + state + '.escalate.' + toState
                    });
                }
            })
        })
    })
    alert_states.forEach(state => {
        levels.forEach(level => {
            event_states.forEach(toState => {
                if (state !== toState) {
                    actions.push({
                        name: 'ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.request'}
                    );
                    actions.push({
                        name: 'ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.resolve'}
                    );
                    actions.push({
                        name: 'ticket.' + state + '.escalate.' + toState
                    });
                }
            })
        })
    })
    // close
    event_states.forEach(state => {
        levels.forEach(level => {
            actions.push({
                name: 'ticket.' + state + '.close.authorization.' + level + '.request'
            });
            actions.push({
                name: 'ticket.' + state + '.close.authorization.' + level + '.resolve'
            });
            actions.push({
                name: 'ticket.' + state + '.close'
            });
        })
    })
    // archive
    event_states.forEach(state => {
        levels.forEach(level => {
            actions.push({
                name: 'ticket.' + state + '.archive.authorization.' + level + '.request'
            });
            actions.push({
                name: 'ticket.' + state + '.archive.authorization.' + level + '.resolve'
            });
            actions.push({
                name: 'ticket.' + state + '.archive'
            });
        })
    })
    // event comments
    event_states.forEach(state => {
        actions.push({
            name: 'ticket.' + state + '.event_management_comment.write'
        });
        actions.push({
            name: 'ticket.' + state + '.event_management_comment.read'
        });
    })
    // alert comments
    alert_states.forEach(state => {
        actions.push({
            name: 'ticket.' + state + '.public_alert_messages.write'
        });
        actions.push({
            name: 'ticket.' + state + '.public_alert_messages.read'
        });
        actions.push({
            name: 'ticket.' + state + '.alert_management_comment.read'
        });
        actions.push({
            name: 'ticket.' + state + '.alert_management_comment.write'
        });
        actions.push({
            name: 'ticket.' + state + '.alert_complementary_comment.read'
        });
        actions.push({
            name: 'ticket.' + state + '.alert_complementary_comment.write'
        });
    })
    actions.push({
        name: 'ticket.' + alert_states[1] + '.close_report_comment.read'
    });
    actions.push({
        name: 'ticket.' + alert_states[1] + '.close_report_comment.write'
    });
    return actions;
}

export const actions = getActions();
