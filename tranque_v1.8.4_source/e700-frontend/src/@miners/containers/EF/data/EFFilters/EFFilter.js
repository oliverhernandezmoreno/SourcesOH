import React from 'react';
import DateRange from './DateRange.js'
import MonthlyComparison from './MonthlyComparison.js'

export const FILTER_TYPES = {
    DATE_RANGE: 'DATE_RANGE',
    MONTHLY_COMPARISON: 'MONTHLY_COMPARISON',
}

const FILTER_COMPONENTS = {
    DATE_RANGE: DateRange,
    MONTHLY_COMPARISON: MonthlyComparison,
}

export default (props) => {
    const {filterType, filters, setFilters} = props;
    const FilterComponent = FILTER_COMPONENTS[filterType] ?? FILTER_COMPONENTS[FILTER_TYPES.DATE_RANGE];
    return (
        <FilterComponent filters={filters} setFilters={setFilters}/>
    );
}