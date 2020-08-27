import {RED_ALERT, WITH_EVENTS, YELLOW_ALERT, WITHOUT_ALERT, NOT_CONFIGURED} from '@authorities/constants/indexState';
import {getTargetIndexesStatus, getWorstIndexStatus, getWorstIndexNumber} from '@authorities/services/indexes';
import {getTargetTickets, getTicketsCount, getAlertColor} from '@authorities/services/tickets';
import * as Sorting from '@authorities/services/home/sorting';
import {getRemoteStatus} from '@authorities/services/remote';

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

/**
 * Function triggered to structure the data
 * in order to use it in the monitoring table.
 *
 * @public
 */
export const generateTableData = (res, indexesData, ticketsData, availability) => {

    const data = res.map(
        item => {
            const targetIndexesStatus = getTargetIndexesStatus(item.canonical_name, indexesData);
            const targetTickets = getTargetTickets(item.canonical_name, ticketsData);
            return {
                name: item.name,
                canonical_name: item.canonical_name,
                work: (item.work_sites && item.work_sites[0]? item.work_sites[0].name : null),
                state: item.state_description,
                entity: (item.work_sites && item.work_sites[0].entity ? item.work_sites[0].entity.name : null),
                region: getZoneInfo(item, 'region'),
                province: getZoneInfo(item, 'provincia'),
                commune: getZoneInfo(item, 'comuna'),
                alertColorEF: getAlertColor(targetTickets, EF_CANONICAL_NAME),
                alertColorEMAC: getAlertColor(targetTickets, EMAC_CANONICAL_NAME),
                disconnectedAlertEF: item.disconnectedAlert && item.disconnectedAlert.ef,
                disconnectedAlertEMAC: item.disconnectedAlert && item.disconnectedAlert.emac, 
                publicAlertIsOffline: false,
                ticketsEFCountA: getTicketsCount(targetTickets, 1, EF_CANONICAL_NAME),
                ticketsEFCountB: getTicketsCount(targetTickets, 2, EF_CANONICAL_NAME),
                ticketsEFCountC: getTicketsCount(targetTickets, 3, EF_CANONICAL_NAME),
                ticketsEFCountD: getTicketsCount(targetTickets, 4, EF_CANONICAL_NAME),
                ticketsEMACCountA: getTicketsCount(targetTickets, 1, EMAC_CANONICAL_NAME),
                ticketsEMACCountB: getTicketsCount(targetTickets, 2, EMAC_CANONICAL_NAME),
                ticketsEMACCountC: getTicketsCount(targetTickets, 3, EMAC_CANONICAL_NAME),
                ticketsEMACCountD: getTicketsCount(targetTickets, 4, EMAC_CANONICAL_NAME),
                conexion: getRemoteStatus(item.remote),
                efPublico: item.efPublico,
                indiceRiesgo: item.indiceRiesgo,
                efInterno: item.efInterno,
                indiceRiesgoEstandar: getWorstIndexStatus(targetIndexesStatus, '.ir'),
                indiceImpacto: null,
                publicWorstIndex: getWorstIndexNumber(item.efInterno, getWorstIndexStatus(targetIndexesStatus, '.ir')),
                monitoreoRemoto: item.monitoreoRemoto
            };
        }

    );

    return addNumberColumns(data, availability).slice().sort((a, b) => -1 * Sorting.getDefaultSortNumber(a, b));
};


/**
 * Function triggered to get the region info (name + natural_key) for a deposit.
 *
 * @param {deposit} the deposit data.
 * @public
 */
function getZoneInfo(deposit, type) {
    if (!deposit.zone) return {name: '', key: null};
    if (type === 'comuna') {
        return {name: deposit.zone.name, key: deposit.zone.natural_key};
    }
    const zoneInfo = deposit.zone.zone_hierarchy;
    if (!zoneInfo) return {name: '', key: null};
    
    const regionInfo = zoneInfo.find((infoElem) => {
        return infoElem.type === type;
    });
    if (!regionInfo) return {name: '', key: null};
    return {name: regionInfo.name, key: regionInfo.natural_key};
}


/**
 * Function triggered to add columns to the table data.
 * These columns are only used for getting information, not for rendering.
 * The information is needed for sorting the table.
 *
 * @param {data} the table data.
 * @public
 */
function addNumberColumns(data, availability) {
    const publicKeys = ['efPublico', 'indiceRiesgo'];
    const internalKeys = ['efInterno', 'indiceRiesgoEstandar', 'indiceImpacto', 'monitoreoRemoto'];

    return data.map(
        item => {
            let publicRedAlerts = 0,
                publicYellowAlerts = 0,
                internalRedAlerts = 0,
                internalYellowAlerts = 0,
                internalEvents = 0,
                withoutAlerts = 0,
                notConfigure = 0;

            publicKeys.forEach(k => {
                if (availability === null || availability[k]) {
                    const value = item[k];
                    if (value === RED_ALERT) ++publicRedAlerts;
                    if (value === YELLOW_ALERT) ++publicYellowAlerts;
                    if (value === WITHOUT_ALERT) ++withoutAlerts;
                    if (value === NOT_CONFIGURED) ++notConfigure;
                }
            });

            internalKeys.forEach(k => {
                if (availability === null || availability[k]) {
                    const value = item[k];
                    if (value === RED_ALERT) ++internalRedAlerts;
                    if (value === YELLOW_ALERT) ++internalYellowAlerts;
                    if (value === WITH_EVENTS) ++internalEvents;
                    if (value === WITHOUT_ALERT) ++withoutAlerts;
                    if (value === NOT_CONFIGURED) ++notConfigure;
                }
            });

            return {
                ...item,
                publicRedAlerts: publicRedAlerts,
                publicYellowAlerts: publicYellowAlerts,
                internalRedAlerts: internalRedAlerts,
                internalYellowAlerts: internalYellowAlerts,
                internalEvents: internalEvents,
                withoutAlerts: withoutAlerts,
                notConfigure: notConfigure
            };
        }
    );
}