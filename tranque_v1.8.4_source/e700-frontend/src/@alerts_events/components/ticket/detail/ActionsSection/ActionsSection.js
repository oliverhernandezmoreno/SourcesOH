import React, { Component } from 'react';
import { Typography, Tabs, Tab, withStyles } from '@material-ui/core';
import ScaleTab from '@alerts_events/components/ticket/detail/ActionsSection/ScaleTab';
import { getGroup, CLOSED, RED_ALERT, YELLOW_ALERT } from '@alerts_events/constants/ticketGroups';
import { canExecute, canEscalate, CLOSE, ESCALATE, ARCHIVE } from '@alerts_events/constants/userActions';
import NoActionsBox from '@alerts_events/components/ticket/detail/ActionsSection/NoActionsBox';
import ActionTab from '@alerts_events/components/ticket/detail/ActionsSection/ActionTab';

const styles = theme => ({
    title: {
        paddingBottom: 20
    },
    tabs: {
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: '#ffffff',
    },
    tabName: {
        textTransform: 'capitalize',
        fontSize: 16
    },
    selectedTab: {
        borderWidth: '1px',
        borderBottomWidth: '0',
        borderStyle: 'solid',
        borderColor: '#ffffff'
    },
    tabIndicator: {
        backgroundColor: '#5c5c5c'
    },
});

const tabNames = {
    close: 'Cerrar',
    scale: 'Escalar',
    archive: 'Archivar',
    unarchive: 'Desarchivar',
    unscale: 'Desescalar'
};

class ActionsSection extends Component {

    getTabContent(tabValue) {
        const {ticket, user, onTicketUpdate, onRequest, requests, requesting} = this.props;
        const actionProps = {
            ticket,
            requests,
            onRequest,
            user,
            requesting
        };
        switch(tabValue) {
            // CERRAR TICKET
            case tabNames.close:
                return <ActionTab {...actionProps}
                    type={CLOSE}
                    conditions={ticket.close_conditions}
                    onTicketUpdate={() => onTicketUpdate(ticket, {state: CLOSED})}
                />;
            // ESCALAR TICKET
            case tabNames.scale:
                return <ScaleTab {...actionProps} onTicketUpdate={onTicketUpdate}/>;
            // ARCHIVAR O DESARCHIVAR TICKET
            case tabNames.archive:
                return <ActionTab {...actionProps}
                    type={ARCHIVE}
                    conditions={ticket.archive_conditions}
                    onTicketUpdate={() => onTicketUpdate(ticket, {archived: true})}
                />;
            case tabNames.unarchive:
                return <ActionTab {...actionProps}
                    type={ARCHIVE}
                    conditions={[]}
                    onTicketUpdate={() => onTicketUpdate(ticket, {archived: false})}
                />;
            // DESESCALAR TICKET
            case tabNames.unscale:
                return <ActionTab {...actionProps}
                    type={ESCALATE}
                    conditions={ticket.escalate_conditions[YELLOW_ALERT]}
                    onTicketUpdate={() => onTicketUpdate(ticket, {state: YELLOW_ALERT})}
                    to_state={YELLOW_ALERT}
                />;
            default: return '';
        }
    }

    getValidTabValue() {
        const {ticket, tabValue, user} = this.props;
        if (!this.isValidTabValue(tabValue)) {
            // When no valid tabValue, return the first valid tab value
            const group = getGroup(ticket);
            if (canExecute(user, CLOSE, group) && ticket.state !== CLOSED) return tabNames.close;
            if (!ticket.archived) {
                if (canExecute(user, ESCALATE, group)) {
                    if (ticket.result_state.level === 6) return tabNames.unscale;
                    else return tabNames.scale;
                }
                if (canExecute(user, ARCHIVE, group)) return tabNames.archive;
            }
            else return null;
        }
        else return tabValue;
    }

    isValidTabValue(value) {
        const {ticket, user} = this.props;
        const group = getGroup(ticket);
        if (!value || value === '' || value === undefined) return false;
        switch(value) {
            case tabNames.close:
                return canExecute(user, CLOSE, group) && ticket.state !== CLOSED;
            case tabNames.archive:
                return !ticket.archived && canExecute(user, ARCHIVE, group);
            case tabNames.unarchive:
                return ticket.archived && canExecute(user, ARCHIVE, group);
            case tabNames.unscale:
                return group === RED_ALERT && canEscalate(user, RED_ALERT, YELLOW_ALERT);
            case tabNames.scale:
                return canExecute(user, ESCALATE, group) &&
                       !canEscalate(user, group, YELLOW_ALERT);
            default: return false;
        }
    }

    renderTab(name) {
        const {classes} = this.props;
        const tabProps = {classes: {selected: classes.selectedTab}};
        return (<Tab key={name} {...tabProps}
            label={<div className={classes.tabName}>{name}</div>}
            value={name}/>)
    }


    hasActions() {
        const {ticket, user} = this.props;
        const group = getGroup(ticket);
        return canExecute(user, CLOSE, group) ||
               canExecute(user, ESCALATE, group) ||
               canExecute(user, ARCHIVE, group);
    }


    render() {
        const {classes, handleTabChange, ticket, user} = this.props;
        if (!ticket || Object.keys(ticket).length === 0) return '';
        const group = getGroup(ticket);
        const title = (
            <Typography variant='h6' className={classes.title}>
                Acciones sobre este ticket
            </Typography>
        );
        const settedTabValue = this.getValidTabValue();
        let content = '';
        if (!this.hasActions()) {
            content = (<>
                {title}
                <NoActionsBox user={user} group={group}/>
            </>);
        }
        else {
            content = (<>
                {title}
                <Tabs classes={{flexContainer: classes.tabs, indicator: classes.tabIndicator}}
                    value={settedTabValue}
                    onChange={handleTabChange}>
                    {
                        (canExecute(user, CLOSE, group) && ticket.state !== CLOSED)
                        && this.renderTab(tabNames.close)
                    }
                    {
                        (canExecute(user, ESCALATE, group) && !ticket.archived) &&
                        (
                            group === RED_ALERT ?
                                this.renderTab(tabNames.unscale) :
                                this.renderTab(tabNames.scale)
                        )
                    }
                    {
                        (canExecute(user, ARCHIVE, group) && (
                            !ticket.archived ?
                                this.renderTab(tabNames.archive) :
                                this.renderTab(tabNames.unarchive)
                        ))
                    }
                </Tabs>
                { this.getTabContent(settedTabValue) }
            </>);
        }
        return content;
    }
}


export default withStyles(styles)(ActionsSection);
