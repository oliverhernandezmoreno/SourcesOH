import React from 'react';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import {withRouter} from 'react-router';
import {Typography, withStyles} from '@material-ui/core';
import TicketDetailContainer from '@alerts_events/containers/TicketDetailContainer';
import TicketListCard from '@alerts_events/components/ticket/TicketListCard';
import { A, B, C, CLOSED, D, RED_ALERT, YELLOW_ALERT,
    getGroup } from '@alerts_events/constants/ticketGroups';
import * as moment from 'moment/moment';
import ListFilters from '@alerts_events/components/ListFilters';
import { getUserTypeRouteString } from '@app/services/userType';



const styles = (theme) => ({
    header: {
        marginBottom: '40px'
    },
    filters: {
        paddingBottom: 20
    },
    noTickets: {
        padding: 20
    }
});

class TicketList extends React.Component {

    state = {
        sortingCriterion: 'level',
        selectedTicket: {},
        checkedA: true,
        checkedB: true,
        checkedC: true,
        checkedD: true,
        ['checked' + YELLOW_ALERT]: true,
        ['checked' + RED_ALERT]: true,
        selectedStartDate: null,
        selectedEndDate: moment().endOf('day'),
        currentRegion: '',
        currentProvince: '',
        currentCommune: '',
        regionProvinces: [],
        provinceCommunes: []
    };

    onTicketClick(ticket) {
        this.setState({selectedTicket: ticket},
            () => history.push(reverse(
                this.getTicketDetailRoute(),
                {target: ticket.target.canonical_name, ticketId: ticket.id}
            )));
    }

    isNationalList() {
        const {location} = this.props;
        return !location.pathname.includes('/deposito/');
    }

    getTicketDetailRoute() {
        const {user, type, group} = this.props;
        const userType = getUserTypeRouteString(user);
        if (this.isNationalList()) {
            // detail from all tickets
            return userType + '.tickets.' + group + '.' + type + '.target.detail';
        } else {
            // detail from Target tickets
            if (userType === 'authorities') {
                return userType + '.target.tickets.' + group + '.' + type + '.detail';
            }
            return userType + '.target.' + group + '.tickets.' + type + '.detail';
        }
    }

    sortingProcedure = {
        default: (t) => [t.created_at],
        level: (t) => [t.result_state.level, t.created_at],
        simple: (t) => [t.children.length === 0 && t.parents.length === 0, t.created_at],
        compound: (t) => [t.children.length > 0 || t.parents.length > 0, t.created_at]
    };

    sortTickets(tickets) {
        const proc = this.sortingProcedure[this.state.sortingCriterion] || this.sortingProcedure.default;
        return tickets.slice().sort((a, b) => {
            const keyA = proc(a);
            const keyB = proc(b);
            // sort lexicographically (keys are arrays)
            const compare = keyA
                .map((k, index) => k < keyB[index] ? -1 : (k > keyB[index] ? 1 : 0))
                .filter((c) => c !== 0);
            // descending order
            return compare.length === 0 ? 0 : (compare[0] === -1 ? 1 : -1);
        });
    }

    onCheckboxChange(checked, checkedName) {
        this.setState({[checkedName]: checked});
    }

    onStartDateSelect = date => this.setState({selectedStartDate: date});
    onEndDateSelect = date => this.setState({selectedEndDate: date});

    handleZoneChange(eventValue, zone) {
        const {regions} = this.props;
        const {regionProvinces} = this.state;
        this.setState({['current' + zone]: eventValue});
        switch (zone) {
            case 'Region':
                this.setState({
                    currentProvince: '',
                    currentCommune: '',
                    regionProvinces: this.getZoneChildren(eventValue, regions, 'provinces'),
                    provinceCommunes: []
                });
                break;
            case 'Province':
                this.setState({
                    currentCommune: '',
                    provinceCommunes: this.getZoneChildren(eventValue, regionProvinces, 'communes')
                });
                break;
            default:
                break;
        }
    }

    getZoneChildren(parentValue, parentItems, childType) {
        const parentItem = parentItems.find((item) => item.label === parentValue.name);
        return parentItem ? parentItem[childType] : [];
    }

    getTicketZone(ticket) {
        let region;
        let province;
        const commune = ticket.target.zone.natural_key;
        ticket.target.zone.zone_hierarchy.forEach(element => {
            switch (element.type) {
                case 'region':
                    region = element.natural_key;
                    break;
                case 'provincia':
                    province = element.natural_key;
                    break;
                default:
                    break;
            }
        });
        return {region, province, commune};
    }

    getFilteredTickets(tickets) {
        const {
            checkedA, checkedB, checkedC, checkedD,
            selectedStartDate, selectedEndDate,
            currentRegion, currentProvince, currentCommune
        } = this.state;
        const checkedYellow = this.state['checked' + YELLOW_ALERT];
        const checkedRed = this.state['checked' + RED_ALERT];
        return tickets.filter((ticket) => {
            const zone = this.getTicketZone(ticket);
            return (
                // Ticket target zone filters
                (
                    (currentRegion === '' || zone.region === currentRegion.natural_key) &&
                    (currentProvince === '' || zone.province === currentProvince.natural_key) &&
                    (currentCommune === '' || zone.commune === currentCommune.natural_key)
                ) &&
                // Ticket creation date range filter
                (
                    (ticket.created_at.isAfter(selectedStartDate) &&
                        ticket.created_at.isBefore(selectedEndDate)) ||
                    (!selectedStartDate && moment(ticket.created_at).isBefore(selectedEndDate)) ||
                    (!selectedEndDate && moment(ticket.created_at).isAfter(selectedStartDate))
                ) &&
                // Ticket group filters (A, B, C, D, Yellow, Red)
                (
                    (getGroup(ticket) === CLOSED) ||
                    (checkedA && getGroup(ticket) === A) ||
                    (checkedB && getGroup(ticket) === B) ||
                    (checkedC && getGroup(ticket) === C) ||
                    (checkedD && getGroup(ticket) === D) ||
                    (checkedYellow && getGroup(ticket) === YELLOW_ALERT) ||
                    (checkedRed && getGroup(ticket) === RED_ALERT)
                )
            );
        });
    }

    renderFilteredList(filteredTickets, classes) {
        const {user} = this.props;
        if (filteredTickets.length === 0) {
            return (
                <Typography className={classes.noTickets}>
                    No hay tickets.
                </Typography>
            );
        } else {
            return filteredTickets.map((t, index) => (
                <TicketListCard
                    user={user}
                    key={`ticket-${index}`}
                    ticket={t}
                    onClick={() => this.onTicketClick(t)}/>
            ));
        }
    }

    render() {
        const {classes, title, tickets, group, type, regions, user} = this.props;
        const {checkedA, checkedB, checkedC, checkedD,
            selectedStartDate, selectedEndDate,
            currentRegion, currentProvince, currentCommune,
            regionProvinces, provinceCommunes
        } = this.state;
        const yellowCheckedName = 'checked' + YELLOW_ALERT;
        const redCheckedName = 'checked' + RED_ALERT;
        const listFilterProps = {
            checkedA, checkedB, checkedC, checkedD,
            [yellowCheckedName]: this.state[yellowCheckedName],
            [redCheckedName]: this.state[redCheckedName],
            onCheckboxChange: (checked, name) => this.onCheckboxChange(checked, name),
            selectedStartDate, selectedEndDate,
            onStartDateSelect: (date) => this.onStartDateSelect(date),
            onEndDateSelect: (date) => this.onEndDateSelect(date),
            regions,
            currentRegion, currentProvince, currentCommune,
            regionProvinces, provinceCommunes,
            handleZoneChange: (value, zone) => this.handleZoneChange(value, zone),
            user
        }
        const sortedTickets = this.sortTickets(tickets);
        const filteredTickets = this.getFilteredTickets(sortedTickets);
        const {selectedTicket} = this.state;
        const {target, ticketId} = this.props.match.params;
        return (
            <>
                <Typography variant="h4" className={classes.header}>{title}</Typography>

                <ListFilters
                    listType={type}
                    {...listFilterProps}
                    national={this.isNationalList()}
                />

                {this.renderFilteredList(filteredTickets, classes)}

                {ticketId && (
                    <TicketDetailContainer
                        key={selectedTicket.id}
                        ticketId={ticketId}
                        location={this.props.location}
                        scope={group}
                        detailRoute={this.getTicketDetailRoute()}
                        target={target}
                        user={user}
                    />
                )}
            </>
        );
    }
}

export default withStyles(styles)(withRouter(TicketList));
