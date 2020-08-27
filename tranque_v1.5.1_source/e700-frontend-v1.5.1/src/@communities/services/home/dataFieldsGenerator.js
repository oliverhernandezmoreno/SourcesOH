import {RED_ALERT, WITH_EVENTS, YELLOW_ALERT, WITHOUT_ALERT, NOT_CONFIGURED} from '@authorities/constants/indexState';
import {getIndexStatus} from '@communities/services/status';
import * as Sorting from '@communities/services/home/sorting';

/**
 * Function triggered to structure the data
 * in order to use it in the monitoring table.
 *
 * @public
 */
export const generateTableData = (res, indexesData, availability) => {

    const data = res.map(
        item => {
            const status = (
                indexesData.find(s => s.target.canonical_name === item.canonical_name) ||
                {status: {result_state: {level: 0}}}
            ).status;
            const targetIndexesStatus = getIndexStatus(status);
            return {
                name: item.name,
                canonical_name: item.canonical_name,
                work: (item.work_sites && item.work_sites[0]? item.work_sites[0].name : null),
                state: item.state,
                entity: (item.work_sites && item.work_sites[0].entity ? item.work_sites[0].entity.name : null),
                efPublico: item.efPublico,
                indiceRiesgo: item.indiceRiesgo,
                efInterno: item.efInterno,
                indiceRiesgoEstandar: targetIndexesStatus,
                indiceImpacto: null,
                publicWorstIndex: targetIndexesStatus,
                monitoreoRemoto: item.monitoreoRemoto
            };
        }

    );

    return addNumberColumns(data, availability).slice().sort((a, b) => -1 * Sorting.getDefaultSortNumber(a, b));
};


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
