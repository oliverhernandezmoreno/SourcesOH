import React from 'react';
import ReactDOM from 'react-dom';
import {cleanup, render} from '@testing-library/react';
import {FormInstanceList} from '@e700/components/instance/FormInstanceList';
import axios from 'axios';

afterEach(cleanup);

beforeEach(() => {
    jest.resetAllMocks();
});

describe('Handling of the answers of the api', () => {
    //describir manejo del mensaje de error

    test.skip('it renders without crashing', () => {
        const div = document.createElement('div');
        const mockRequest = Promise.resolve({
            data: {results: []},
            status: 200,
            statusText: 'Ok',
            headers: {},
            config: {}
        });
        const mockCallBack = jest.fn(() => mockRequest);
        axios.default.mockImplementation(mockCallBack);
        ReactDOM.render(<FormInstanceList/>, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    test.skip('it shows a message when there are no instance in the server', async () => {
        // Arrange
        // it suposse that the user is login
        const mockRequest = Promise.resolve({
            data: [],
            status: 200,
            statusText: 'Ok',
            headers: {},
            config: {}
        });
        const mockCallBack = jest.fn(() => mockRequest);
        axios.default.mockImplementation(mockCallBack);
        const expectedText = 'No se encontraron instancias de formulario E700 abiertas';
        // Act
        const {getByText} = render(<FormInstanceList/>);
        const element = getByText(expectedText);
        // Assert
        await mockRequest;
        expect(element).toBeDefined();

    });

    test.skip('it shows a list of instances obtained from the server', async () => {
        // Arrange
        const OPEN_STATE = 'open';
        const CLOSED_STATE = 'sent';
        const fakeInstances = [
            {
                id: '1',
                state: OPEN_STATE,
                start_date: '2019-04-12T04:00:00Z',
                end_date: '2019-05-22T04:00:00Z',
                created_at: '2019-04-10T04:07:23.389523Z',
                updated_at: '2019-04-10T04:07:23.389535Z'
            },
            {
                id: '2',
                state: CLOSED_STATE,
                start_date: '2019-04-12T04:00:00Z',
                end_date: '2019-05-22T04:00:00Z',
                created_at: '2019-04-10T04:07:23.389523Z',
                updated_at: '2019-04-10T04:07:23.389535Z'
            }
        ];
        const mockRequest = Promise.resolve({
            data: fakeInstances,
            status: 200,
            statusText: 'Ok',
            headers: {},
            config: {}
        });

        // Act
        const mockCallBack = jest.fn(() => mockRequest);
        axios.default.mockImplementation(mockCallBack);
        const {getAllByTestId} = render(<FormInstanceList/>);
        // Assert
        await mockRequest;
        const instances = getAllByTestId('instance').map(el => el.textContent);
        const fakeInstancesNames = ['No iniciado', 'Enviado'];

        expect(instances).toEqual(fakeInstancesNames);
    });
});
