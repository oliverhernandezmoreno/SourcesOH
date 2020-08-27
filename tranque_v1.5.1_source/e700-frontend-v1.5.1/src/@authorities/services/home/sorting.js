
/**
* Function triggered to get a sortNumber
* to sort the deposit name column by name in the MonitoringTable component.
*
* @param {data1} the data for a table row.
* @param {data2} the data for another table row.
* @public
*/
export const getNameSortNumber = (data1, data2) => {
    return data1.name.trim().localeCompare(data2.name.trim());
}


/**
* Function triggered to get a sortNumber
* to sort the deposit name column by state.
*
* @param {data1} the data for a table row.
* @param {data2} the data for another table row.
* @public
*/
export const getStateSortNumber = (data1, data2) => {
    const states = [{name: 'abandonado', number: 2}, {name: 'inactivo', number: 1}, {name: 'activo', number: 0}];
    const data1State = states.find((state) => data1.state.trim().toLowerCase() === state.name);
    const data2State = states.find((state) => data2.state.trim().toLowerCase() === state.name);
    if (!data1State) return 1;
    if (!data2State) return -1;
    if (data1State.number === data2State.number) return -getDefaultSortNumber(data1, data2);
    return data1State.number - data2State.number;
}

/**
* Function triggered to get a sortNumber
* to sort an icon column in the MonitoringTable component.
*
* @param {data1} the data for a table row.
* @param {data2} the data for another table row.
* @param {field} the name of the field to be sorted.
* @public
*/
export const getSortNumber = (data1, data2, field) => {
    var sortNumber = data1[field] - data2[field];
    if (sortNumber === 0) return getDefaultSortNumber(data1, data2);
    return sortNumber;
}


/**
* Function triggered to get a sortNumber
* to decide the default position of the rows in the MonitoringTable component.
*
* The default positions are defined according to the following:
* 1. Deposits with failed connection.
* 2. Deposits with normal connection.
* 3. Not in SMC deposits.
* 4. Deposits with at least one public red alert.
* 5. Deposits with at least one public yellow alert.
* 6. Deposits with at least one internal red alert.
* 7. Deposits with at least one internal yellow alert.
* 8. Deposits with at least one event.
*
*
* @param {data1} the data for a table row.
* @param {data2} the data for another table row.
* @public
*/
export const getDefaultSortNumber = (data1, data2) => {
    var sortNumber = data1.conexion - data2.conexion;
    if (sortNumber === 0) sortNumber = data1.publicRedAlerts - data2.publicRedAlerts;
    if (sortNumber === 0) sortNumber = data1.publicYellowAlerts - data2.publicYellowAlerts;
    if (sortNumber === 0) sortNumber = data1.internalRedAlerts - data2.internalRedAlerts;
    if (sortNumber === 0) sortNumber = data1.internalYellowAlerts - data2.internalYellowAlerts;
    if (sortNumber === 0) sortNumber = data1.internalEvents - data2.internalEvents;
    if (sortNumber === 0) sortNumber = data1.withoutAlerts - data2.withoutAlerts;
    if (sortNumber === 0) sortNumber = data1.notConfigure - data2.notConfigure;
    return sortNumber;
}
