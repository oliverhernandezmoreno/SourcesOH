import React from 'react';
import {render} from '@testing-library/react';
import DataSourceSheet from '@miners/containers/EF/data/EFViews/DataSourceSheet';
import { MemoryRouter } from 'react-router';

const fileData = {
    location: 'Location info...',
    coords: `469149 E 7379171 N`,
    sector: 'Sector info...',
    drenaje: 'Drenaje info...',
};

function getDataSourceSheet(props) {
    return <MemoryRouter initialEntries={['/']}>
        <DataSourceSheet {...props}/>
    </MemoryRouter>;
}

describe('DataSourceSheet', () => {

    it('should contains file data fields', () => {
        const {getByText} = render(getDataSourceSheet({fileData}))
        getByText(/Location info.../i);
        getByText(/469149 E 7379171 N/i);
        getByText(/Sector info.../i);
        getByText(/Drenaje info.../i);
    });

    it('should not contains sector', () => {
        const {queryByText} = render(getDataSourceSheet({fileData, excludeSector: true}))
        expect(queryByText(/Sector info.../i)).toBeNull();
    });

    it('should not contains drenaje', () => {
        const {queryByText} = render(getDataSourceSheet({fileData, excludeDrenaje: true}))
        expect(queryByText(/Drenaje info.../i)).toBeNull();
    });
});

