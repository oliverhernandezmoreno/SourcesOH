import * as moment from 'moment';

export const getDateSortNumber = (data1, data2) => {
    const date1 = moment(data1);
    const date2 = moment(data2);
    if (!date1.isValid() && !date1.isValid()) return 0;
    if (!date1.isValid()) return 1;
    if (!date2.isValid()) return -1;
    if (date1.isSame(moment(date2))) return 0;
    if (date1.isBefore(date2)) return 1;
    else return -1;
}

export const getZoneSortNumber = (data1, data2) => {
    return data1.label.trim().localeCompare(data2.label.trim());
}
