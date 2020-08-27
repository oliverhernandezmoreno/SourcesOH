/* eslint-disable-next-line */
import axios from 'axios';

const axiosMock = jest.genMockFromModule('axios');
const defaultMock = jest.fn((config) => {
    return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'Ok',
        headers: {},
        config: {}
    });
});

axiosMock.default.mockImplementation(defaultMock);
axiosMock.post.mockImplementation(defaultMock);

axiosMock.create = jest.fn(() => axiosMock);
axiosMock.CancelToken = {
    source: () => {
        return {
            token: '',
            cancel: jest.fn(() => {
            })
        };
    }
};

module.exports = axiosMock;
