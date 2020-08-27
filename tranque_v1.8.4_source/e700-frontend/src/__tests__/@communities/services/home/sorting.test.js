import { NOT_IN_SMC, CONNECTED, FAILED } from '@authorities/constants/connectionState';
import { getDefaultSortNumber, getStateSortNumber } from '@authorities/services/home/sorting';


test("data 1 and data2 with different number of green semaphores",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:0,
            internalEvents:0,
            withoutAlerts:1,
            notConfigure: 0
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:0,
            internalEvents:0,
            withoutAlerts:0,
            notConfigure: 0
        };
        expect(getDefaultSortNumber(data1, data2)).toBeGreaterThan(0); // data1 first
    });

test("data 1 and data2 with same state connection and alerts",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:0,
            internalEvents:0,
            withoutAlerts:3,
            notConfigure: 0
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:0,
            internalEvents:0,
            withoutAlerts:3,
            notConfigure: 0
        };
        expect(getDefaultSortNumber(data1, data2)).toEqual(0); // data1 = data2
    });

test("data1 and data2 with different number of events",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:0,
            internalEvents:3
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:0,
            internalEvents:2
        };
        expect(getDefaultSortNumber(data1, data2)).toBeGreaterThan(0); // data1 first
    });

test("data1 and data2 with different number of internal yellow alerts",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:1,
            internalEvents:2
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:0,
            internalYellowAlerts:2,
            internalEvents:1
        };
        expect(getDefaultSortNumber(data1, data2)).toBeLessThan(0); // data2 first
    });

test("data1 and data2 with different number of internal red alerts",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:2,
            internalYellowAlerts:1,
            internalEvents:0
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:0,
            internalRedAlerts:1,
            internalYellowAlerts:2,
            internalEvents:1
        };
        expect(getDefaultSortNumber(data1, data2)).toBeGreaterThan(0); // data1 first
    });

test("data1 and data2 with different number of public yellow alerts",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:1,
            internalRedAlerts:2,
            internalYellowAlerts:1,
            internalEvents:0
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: CONNECTED,
            publicRedAlerts:0,
            publicYellowAlerts:2,
            internalRedAlerts:1,
            internalYellowAlerts:1,
            internalEvents:1
        };
        expect(getDefaultSortNumber(data1, data2)).toBeLessThan(0); // data2 first
    });

test("data1 and data2 with different number of public red alerts",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:2,
            publicYellowAlerts:0,
            internalRedAlerts:2,
            internalYellowAlerts:1,
            internalEvents:0
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: CONNECTED,
            publicRedAlerts:1,
            publicYellowAlerts:1,
            internalRedAlerts:1,
            internalYellowAlerts:1,
            internalEvents:1
        };
        expect(getDefaultSortNumber(data1, data2)).toBeGreaterThan(0); // data1 first
    });

test("data1 and data2 with different SMC settings",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: CONNECTED,
            publicRedAlerts:2,
            publicYellowAlerts:0,
            internalRedAlerts:2,
            internalYellowAlerts:1,
            internalEvents:0
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: NOT_IN_SMC,
            publicRedAlerts:1,
            publicYellowAlerts:1,
            internalRedAlerts:1,
            internalYellowAlerts:1,
            internalEvents:1
        };
        expect(getDefaultSortNumber(data1, data2)).toBeGreaterThan(0); // data1 first
    });

test("data1 and data2 with different state connection",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            conexion: FAILED,
            publicRedAlerts:2,
            publicYellowAlerts:2,
            internalRedAlerts:2,
            internalYellowAlerts:1,
            internalEvents:0
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            conexion: NOT_IN_SMC,
            publicRedAlerts:1,
            publicYellowAlerts:1,
            internalRedAlerts:1,
            internalYellowAlerts:1,
            internalEvents:1
        };
        expect(getDefaultSortNumber(data1, data2)).toBeGreaterThan(0); // data1 first
    });


test("data1 and data2 with different state",
    () => {
        const data1 = {
            name: "[Nombre del depósito1]",
            state: "inactivo",
            conexion: CONNECTED,
            publicRedAlerts:3,
            publicYellowAlerts:3,
            internalRedAlerts:3,
            internalYellowAlerts:3,
            internalEvents:3
        };
        const data2 = {
            name: "[Nombre del depósito2]",
            state: "activo",
            conexion: CONNECTED,
            publicRedAlerts:1,
            publicYellowAlerts:1,
            internalRedAlerts:1,
            internalYellowAlerts:1,
            internalEvents:1
        };
        const data3 = {
            name: "[Nombre del depósito3]",
            state: "abandonado",
            conexion: CONNECTED,
            publicRedAlerts:2,
            publicYellowAlerts:2,
            internalRedAlerts:2,
            internalYellowAlerts:2,
            internalEvents:2
        };
        const data4 = {
            name: "[Nombre del depósito4]",
            state: "activo",
            conexion: CONNECTED,
            publicRedAlerts:2,
            publicYellowAlerts:2,
            internalRedAlerts:2,
            internalYellowAlerts:2,
            internalEvents:2
        };
        expect(getStateSortNumber(data1, data2)).toBeGreaterThan(0); // data2 first
        expect(getStateSortNumber(data2, data3)).toBeLessThan(0); // data2 first
        expect(getStateSortNumber(data1, data3)).toBeLessThan(0); // data1 first
        expect(getStateSortNumber(data2, data4)).toBeGreaterThan(0); // data4 first
    });
