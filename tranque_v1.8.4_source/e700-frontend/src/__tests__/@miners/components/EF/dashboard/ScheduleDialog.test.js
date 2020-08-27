import React from 'react';
import moment from 'moment';
import 'moment/locale/es';
import {render} from '@testing-library/react';
import ScheduleDialog from '@miners/components/EF/dashboard/ScheduleDialog';

describe('EF/dashboard/ScheduleDialog', () => {
    it('should render without other props, only toggling the open prop', () => {
        render(<ScheduleDialog />);
        render(<ScheduleDialog open />);
    });

    it('should render the inner component without props', () => {
        render(<ScheduleDialog.Inner />);
    });

    it('should show the title according to the rows and openRow properties', () => {
        const {getByText} = render(
            <ScheduleDialog.Inner rows={[{label: 'Not this one'}, {label: 'This one yes'}]} openRow={1} />
        );
        getByText('This one yes');
    });

    it('should show the subtitle according to the frequency information in container in rowData', () => {
        render(
            <ScheduleDialog.Inner
                rows={[{label: 'foo'}]}
                openRow={0}
                rowData={[
                    {
                        whateverFoo: [
                            {
                                frequencies: [{minutes: '60'}],
                            },
                            {
                                frequencies: [{minutes: '60'}],
                            },
                        ],
                    },
                ]}
            />
        ).getByText('Frecuencia de ingreso: cada una hora');

        render(
            <ScheduleDialog.Inner
                rows={[{label: 'foo'}]}
                openRow={0}
                rowData={[
                    {
                        whateverFoo: [
                            {
                                frequencies: [{minutes: '120'}],
                            },
                            {
                                frequencies: [{minutes: '60'}],
                            },
                        ],
                    },
                ]}
            />
        ).getByText('Frecuencia de ingreso: cada 2 horas, cada una hora');
    });

    it('when given timeseries linked to sources, should display a table with information for each one', () => {
        const {getAllByText} = render(
            <ScheduleDialog.Inner
                rows={[{label: 'foo'}]}
                openRow={0}
                rowData={[
                    {
                        whateverFoo: [
                            {
                                data_source: {
                                    name: 'PZ01',
                                    group_names: ['Sector C'],
                                },
                                frequencies: [{minutes: '60'}],
                                events: [{date: moment()}],
                            },
                            {
                                data_source: {
                                    name: 'PZ02',
                                    group_names: ['Sector B', 'Especial'],
                                },
                                frequencies: [{minutes: '60'}],
                            },
                            {
                                data_source: {
                                    name: 'PZ03',
                                    group_names: ['Sector C'],
                                },
                                frequencies: [],
                            },
                        ],
                    },
                ]}
            />
        );
        expect(getAllByText('Sector C')).toHaveLength(2);
        expect(getAllByText('Pendiente')).toHaveLength(2);
        expect(getAllByText('PZ01')).toHaveLength(1);
        expect(getAllByText('Sector B, Especial')).toHaveLength(1);
    });

    it('when given timeseries linked to groups, should display a table with information for each one', () => {
        const {getByText} = render(
            <ScheduleDialog.Inner
                rows={[{label: 'foo'}]}
                openRow={0}
                rowData={[
                    {
                        whateverFoo: [
                            {
                                data_source_group: {
                                    name: 'Sector C',
                                },
                                frequencies: [{minutes: '60'}],
                                events: [{date: moment()}],
                            },
                            {
                                data_source_group: {
                                    name: 'Sector D',
                                },
                                frequencies: [{minutes: '60'}],
                            },
                            {
                                data_source_group: {
                                    name: 'Sector E',
                                },
                                frequencies: [],
                            },
                        ],
                    },
                ]}
            />
        );
        getByText('Sector C');
        getByText('Sector D');
        getByText('Sector E');
    });

    it('when given timeseries linked to nothing, should display a table with information for each one', () => {
        const {getAllByText} = render(
            <ScheduleDialog.Inner
                rows={[{label: 'foo'}]}
                openRow={0}
                rowData={[
                    {
                        whateverFoo: [
                            {
                                frequencies: [{minutes: '60'}],
                                events: [{date: moment()}],
                            },
                            {
                                frequencies: [{minutes: '60'}],
                            },
                            {
                                frequencies: [],
                            },
                        ],
                        whateverFooBar: [
                            {
                                frequencies: [{minutes: '60'}],
                                events: [{date: moment()}],
                            },
                        ]
                    },
                ]}
            />
        );
        expect(getAllByText(/.*/, {selector: 'tr'})).toHaveLength(6); // two headers and four body rows
        expect(getAllByText(/.*/, {selector: 'table'})).toHaveLength(2);
    });
});
