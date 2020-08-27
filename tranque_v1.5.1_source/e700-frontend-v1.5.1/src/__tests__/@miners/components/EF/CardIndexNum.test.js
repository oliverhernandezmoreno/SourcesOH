import React from 'react';
import {render} from '@testing-library/react';
import CardIndexNum from '@miners/components/EF/CardIndexNum';
import configureMockStore from 'redux-mock-store';
import {Provider} from 'react-redux';
import {TimeSeriesReducer} from '@miners/reducers/timeseries';

const mockStore = configureMockStore();
const store = mockStore(TimeSeriesReducer, {template_name: 0});


describe('CarIndexNum', () => {

    // it('should contains data', () => {
    //     const {getByText} = render(
    //         <Provider store={store}>
    //             <CardIndexNum data="22222"/>
    //         </Provider>);
    //     getByText(/22,222/i);
    //
    // });


    // it('should contains data null', () => {
    //     const {getByText} = render(
    //         <Provider store={store}>
    //             <CardIndexNum data=""/>
    //         </Provider>);
    //     getByText(/ /i);
    //
    // });


    it('should contains name', () => {
        const {getByText} = render(
            <Provider store={store}>
                <CardIndexNum name="Revancha Hidráulica"/>
            </Provider>);
        getByText(/Revancha hidráulica/i);

    });

    // it('should contains name null', () => {
    //     const {getByText} = render(
    //         <Provider store={store}>
    //             <CardIndexNum name=""/>
    //         </Provider>);
    //     getByText(/ /i);
    //
    // });
    //
    it('should contains date', () => {
        const {getByText} = render(
            <Provider store={store}>
                <CardIndexNum date="2019.01.26 21:00:00"/>
            </Provider>);
        getByText(/2019.01.26 21:00:00/i);

    });
    //
    // it('should contains date null', () => {
    //     const {getByText} = render(
    //         <Provider store={store}>
    //             <CardIndexNum date=""/>
    //         </Provider>);
    //     getByText(/ /i);
    //
    // });
    //
    //
    it('should contains source', () => {
        const {getByText} = render(
            <Provider store={store}>
                <CardIndexNum source="sector-a"/>
            </Provider>);
        getByText(/sector-a/i);

    });

    // it('should contains source null', () => {
    //     const {getByText} = render(
    //         <Provider store={store}>
    //             <CardIndexNum source=" "/>
    //         </Provider>);
    //     getByText(/ /i);
    //
    // });
    //
    //
    it('should contains units', () => {
        const {getByText} = render(
            <Provider store={store}>
                <CardIndexNum units="m"/>
            </Provider>);
        getByText(/m/i);

    });
    //
    // it('should contains units null', () => {
    //     const {getByText} = render(
    //         <Provider store={store}>
    //             <CardIndexNum units=" "/>
    //         </Provider>);
    //     getByText(/ /i);
    //
    // });

});
