import React, {Component} from 'react';
import { CircularProgress, withStyles } from '@material-ui/core';
import ContainedButton from '@app/components/utils/ContainedButton';
import { PENDING } from '@alerts_events/constants/authorizationStates';
import DashedBox from '@alerts_events/components/DashedBox';


const styles = theme => ({
    box: {
        width: 335
    },
    button: {
        paddingLeft: 10
    }
});

class RequestButton extends Component {

    render() {
        const {classes, ticket, requests, text, onClick, requesting} = this.props;
        return  requests.some(req => {
            return req.ticket === ticket.id && req.status === PENDING;
        }) ?
            <div className={classes.box}>
                <DashedBox content='Ya existe una solicitud pendiente para este ticket'/>
            </div> :
            <div className={classes.button}>
                <ContainedButton
                    text={text}
                    buttonProps={{
                        startIcon: requesting && <CircularProgress size={20}/>,
                        onClick: () => onClick(),
                        disabled: requesting
                    }}
                />
            </div>;
    }
}

export default withStyles(styles)(RequestButton);
