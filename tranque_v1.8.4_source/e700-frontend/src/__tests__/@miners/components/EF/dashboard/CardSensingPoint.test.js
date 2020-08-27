import React from 'react';
import {render} from '@testing-library/react';
import CardSensingPoint from '@miners/components/EF/dashboard/CardSensingPoint';

const cardProps = {
    title: '',
    values: [],
    goToDetail: () => {},
    loading: false
}

describe('CardSensingPoint', () => {

    it('should contains a title', () => {
        const {getByText} = render(
            <CardSensingPoint
                {...cardProps}
                title={'Título del componente'}
            />);
        getByText(/TÍTULO DEL COMPONENTE/i);
    });
    it('should contains a chip name', () => {
        const {getByText} = render(
            <CardSensingPoint
                {...cardProps}
                values={[{name: 'PZ Chip', values: 0, threshold: 0}]}
            />);
        getByText(/PZ Chip/i);
    });
});
