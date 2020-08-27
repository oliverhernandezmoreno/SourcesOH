import React from 'react';
import moment from 'moment';
import 'moment/locale/es';
import {render} from '@testing-library/react';
import Schedule from '@miners/components/EF/dashboard/Schedule';

describe('EF/dashboard/Schedule', () => {
    it('should render without props', () => {
        render(<Schedule />);
    });

    it('should present a set of items according to the rows property', () => {
        const {getAllByText} = render(<Schedule rows={[{label: 'foo'}, {label: 'foo'}, {label: 'foo'}]} />);
        expect(getAllByText('foo')).toHaveLength(3);
    });

    it('should present the condensed version of timeseries status next to a label', () => {
        const {getAllByText} = render(
            <Schedule
                rows={[{label: 'foo'}, {label: 'bar'}, {label: 'baz'}]}
                rowData={[
                    {
                        whateverFoo: [{frequencies: [{minutes: '60'}], events: [{date: moment()}]}],
                    },
                    {
                        whateverBar: [
                            {
                                frequencies: [{minutes: '60'}],
                                events: [{date: moment().subtract(61, 'minutes')}],
                            },
                        ],
                    },
                    {
                        whateverBaz: [{frequencies: [], events: [{date: moment()}]}],
                    },
                ]}
            />
        );
        expect(getAllByText('en una hora')).toHaveLength(1);
        expect(getAllByText('Pendiente')).toHaveLength(1);
        expect(getAllByText('Sin definición')).toHaveLength(1);
    });
});
