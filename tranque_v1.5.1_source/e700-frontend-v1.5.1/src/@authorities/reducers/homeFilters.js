

export const initialState = {
    aut_home_selected_profile_monitoring_table: '',
    aut_home_selected_profile_monitoring_alerts: '',

    aut_home_selected_region: '',
    aut_home_selected_province: '',
    aut_home_selected_commune: '',
    aut_home_selected_state: '',
    
    aut_home_no_alert_switch: true,
    aut_home_yellow_alert_switch: true,
    aut_home_red_alert_switch: true,
    aut_home_disconnected_alert_switch: true,

    aut_home_emac_index_ire_switch: false,
    aut_home_emac_index_irr_switch: false,
    aut_home_emac_index_ii_switch: false,

    aut_home_data_frequency_switch: false,
    aut_home_conection_switch: false
};

const filterReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_PROFILE_MONITORING_TABLE': {
            return {...state, aut_home_selected_profile_monitoring_table: action.selected };
        }
        case 'SET_PROFILE_MONITORING_ALERTS': {
            return {...state, aut_home_selected_profile_monitoring_alerts: action.selected };
        }
        case 'SET_REGION': {
            return {...state, aut_home_selected_region: action.selected };
        }
        case 'SET_PROVINCE': {
            return {...state, aut_home_selected_province: action.selected };
        }
        case 'SET_COMMUNE': {
            return {...state, aut_home_selected_commune: action.selected };
        }
        case 'SET_TARGET_STATE': {
            return {...state, aut_home_selected_state: action.selected };
        }
        case 'SET_NO_ALERT_SWITCH': {
            return {...state, aut_home_no_alert_switch: action.checked};
        }     
        case 'SET_YELLOW_ALERT_SWITCH': {
            return {...state, aut_home_yellow_alert_switch: action.checked};
        }     
        case 'SET_RED_ALERT_SWITCH': {
            return {...state, aut_home_red_alert_switch: action.checked};
        }
        case 'SET_DISCONNECTED_ALERT_SWITCH': {
            return {...state, aut_home_disconnected_alert_switch: action.checked};
        }

        case 'SET_EMAC_INDEX_IRE_SWITCH': {
            return {...state, aut_home_emac_index_ire_switch: action.checked};
        }  
        case 'SET_EMAC_INDEX_IRR_SWITCH': {
            return {...state, aut_home_emac_index_irr_switch: action.checked};
        }  
        case 'SET_EMAC_INDEX_II_SWITCH': {
            return {...state, aut_home_emac_index_ii_switch: action.checked};
        }  

        case 'SET_DATA_FREQUENCY_SWITCH': {
            return {...state, aut_home_data_frequency_switch: action.checked};
        }  
        case 'SET_CONECTION_SWITCH': {
            return {...state, aut_home_conection_switch: action.checked};
        }
        default: {
            return state;
        }
    }
};

export default filterReducer;
