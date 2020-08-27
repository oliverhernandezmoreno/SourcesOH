import React, {Component} from 'react';
import {Grid, withStyles} from '@material-ui/core';
import CheckboxGroup from '@app/components/utils/CheckboxGroup';
import { A, B, C, D, YELLOW_ALERT, RED_ALERT,
    groupPluralNames } from '@alerts_events/constants/ticketGroups';
import * as moment from 'moment/moment';
import DatePicker from '@app/components/utils/DatePicker';
import TSelect from '@app/components/utils/TSelect';
import {COLORS} from '@miners/theme';
import { canSeeTicket } from '@alerts_events/constants/userActions';

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

class ListFilters extends Component {

    getCheckboxData(group) {
        const stateName = 'checked' + group;
        return {
            label: groupPluralNames[group],
            checked: this.props[stateName],
            onChange: (checked) => this.props.onCheckboxChange(checked, stateName)
        };
    }

    renderLevelCheckboxes() {
        const {listType, user} = this.props;
        const ticketGroupCheckboxes = [];
        if (canSeeTicket(user, A)) {
            ticketGroupCheckboxes.push(this.getCheckboxData(A));
        }
        ticketGroupCheckboxes.push(this.getCheckboxData(B));
        ticketGroupCheckboxes.push(this.getCheckboxData(C));
        ticketGroupCheckboxes.push(this.getCheckboxData(D));
        ticketGroupCheckboxes.push(this.getCheckboxData(YELLOW_ALERT));
        ticketGroupCheckboxes.push(this.getCheckboxData(RED_ALERT));
        return (
            <CheckboxGroup row title='Ver:'
                checkboxProps={{
                    disabled: listType === 'closed'
                }}
                enabledStyle={{color: COLORS.buttons.contained}}
                data={ticketGroupCheckboxes} />
        );
    }

    renderDatePickers() {
        const {selectedStartDate, selectedEndDate,
            onStartDateSelect, onEndDateSelect} = this.props;
        return (<Grid container spacing={2}>
            <Grid item>
                <DatePicker keyboard
                    label="Desde"
                    maxDate={selectedEndDate || moment().endOf('day')}
                    value={selectedStartDate}
                    onChange={onStartDateSelect} />
            </Grid>
            <Grid item>
                <DatePicker keyboard
                    label="Hasta"
                    maxDate={moment().endOf('day')}
                    minDate={selectedStartDate || undefined}
                    value={selectedEndDate}
                    onChange={onEndDateSelect} />
            </Grid>
        </Grid>);
    }

    renderZoneFilters() {
        const {regions, currentRegion, currentProvince, currentCommune,
            regionProvinces, provinceCommunes} = this.props;
        const handleZoneChange = this.props.handleZoneChange;
        return (
            <Grid container spacing={2}>
                <Grid item style={{minWidth: 350}}>
                    <TSelect
                        field='Región'
                        defaultValue='Todas las regiones'
                        menuItems={regions}
                        onChange={(event) =>  handleZoneChange(event.target.value, 'Region')}
                        selected={currentRegion}/>
                </Grid>
                <Grid item style={{minWidth: 300}}>
                    <TSelect
                        disabled={regionProvinces.length === 0}
                        field='Provincia'
                        defaultValue='Todas las provincias'
                        menuItems={regionProvinces}
                        onChange={(event) => handleZoneChange(event.target.value, 'Province')}
                        selected={currentProvince}/>
                </Grid>
                <Grid item style={{minWidth: 300}}>
                    <TSelect
                        disabled={provinceCommunes.length === 0}
                        field='Comuna'
                        defaultValue='Todas las comunas'
                        menuItems={provinceCommunes}
                        onChange={(event) => handleZoneChange(event.target.value, 'Commune')}
                        selected={currentCommune}/>
                </Grid>
            </Grid>);
    }

    render() {
        const {classes, national} = this.props;
        return (
            <Grid container direction='column' spacing={2} className={classes.filters}>
                <Grid item>
                    {national && this.renderZoneFilters()}
                </Grid>
                <Grid item>
                    {this.renderDatePickers()}
                </Grid>
                <Grid item>
                    {this.renderLevelCheckboxes()}
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(ListFilters);
