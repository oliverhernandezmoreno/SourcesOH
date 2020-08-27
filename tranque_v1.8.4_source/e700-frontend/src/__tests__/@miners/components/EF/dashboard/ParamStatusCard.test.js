import React from 'react';
import {render} from '@testing-library/react';
import ParamStatusCard from '@miners/components/EF/dashboard/ParamStatusCard';
import configureMockStore from 'redux-mock-store';
import {Provider} from 'react-redux';
import {TimeSeriesReducer} from '@miners/reducers/timeseries';
import {LOWER} from '@miners/constants/thresholdTypes';

const mockStore = configureMockStore();
const store = mockStore(TimeSeriesReducer, {template_name: 0});

const paramInfo = {
    title: 'Distancia mínima Laguna Muro',
    paramValue: '8,9',
    date: '12.02.2019',
    sector: '[Nombre de sector]',
    thresholdType: LOWER,
    threshold: 4,
    thresholdUnit: '[m]'
}

describe('ParamStatusCard', () => {

    it('should contains data', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{paramValue: "22222"}}/>
            </Provider>);
        getByText(/22222/i);
    });
    it('should contains data null', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{...paramInfo, paramValue: null}}/>
            </Provider>);
        getByText(/-/i);
    });

    it('should contains name', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{title: "Revancha Hidráulica"}}/>
            </Provider>);
        getByText(/Revancha hidráulica/i);

    });
    it('should contains name null', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{...paramInfo, title: null}}/>
            </Provider>);
        getByText(/-/i);
    });


    it('should contains date', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{date: "2019.01.26 21:00:00"}}/>
            </Provider>);
        getByText(/2019.01.26 21:00:00/i);

    });
    it('should contains date null', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{...paramInfo, date: null}}/>
            </Provider>);
        getByText(/-/i);
    });

    it('should contains source', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{sector: "sector-a"}}/>
            </Provider>);
        getByText(/sector-a/i);

    });
    it('should contains source null', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{...paramInfo, sector: null}}/>
            </Provider>);
        getByText(/-/i);
    });


    it('should contains units', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{threshold: 6, thresholdUnit: 'mt'}}/>
            </Provider>);
        getByText(/mt/i);

    });
    it('should contains units null', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ParamStatusCard data={{...paramInfo, thresholdUnit: null}}/>
            </Provider>);
        getByText(/-/i);
    });
});
