function setProfileMonitoringTable(selected) {
    return {
        type: 'SET_PROFILE_MONITORING_TABLE',
        selected
    }
}

function setProfileMonitoringAlerts(selected) {
    return {
        type: 'SET_PROFILE_MONITORING_ALERTS',
        selected
    }
}

function setRegion(selected) {
    return {
        type: 'SET_REGION',
        selected
    }
}

function setProvince(selected) {
    return {
        type: 'SET_PROVINCE',
        selected
    }
}

function setCommune(selected) {
    return {
        type: 'SET_COMMUNE',
        selected
    }
}

function setTargetState(selected) {
    return {
        type: 'SET_TARGET_STATE',
        selected
    }
}

function setNoAlertSwitch(checked) {
    return {
        type: 'SET_NO_ALERT_SWITCH',
        checked
    }
}

function setYellowAlertSwitch(checked) {
    return {
        type: 'SET_YELLOW_ALERT_SWITCH',
        checked
    }
}

function setRedAlertSwitch(checked) {
    return {
        type: 'SET_RED_ALERT_SWITCH',
        checked
    }
}

function setEmacIndexIReSwitch(checked) {
    return {
        type: 'SET_EMAC_INDEX_IRE_SWITCH',
        checked
    }
}

function setEmacIndexIRrSwitch(checked) {
    return {
        type: 'SET_EMAC_INDEX_IRR_SWITCH',
        checked
    }
}

function setEmacIndexIISwitch(checked) {
    return {
        type: 'SET_EMAC_INDEX_II_SWITCH',
        checked
    }
}

function setDisconnectedAlertSwitch(checked) {
    return {
        type: 'SET_DISCONNECTED_ALERT_SWITCH',
        checked
    }
}

function setDataFrequencySwitch(checked) {
    return {
        type: 'SET_DATA_FREQUENCY_SWITCH',
        checked
    }
}
function setConnectionSwitch(checked) {
    return {
        type: 'SET_CONECTION_SWITCH',
        checked
    }
}

export const homeFiltersActions = {
    setProfileMonitoringTable,
    setProfileMonitoringAlerts,
    setRegion,
    setProvince,
    setCommune,
    setTargetState,
    setNoAlertSwitch,
    setYellowAlertSwitch,
    setRedAlertSwitch,
    setEmacIndexIReSwitch,
    setEmacIndexIRrSwitch,
    setEmacIndexIISwitch,
    setDisconnectedAlertSwitch,
    setDataFrequencySwitch,
    setConnectionSwitch
};
