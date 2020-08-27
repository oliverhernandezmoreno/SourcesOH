import {isYellow} from '@miners/components/EF/IconStatus';
import {UPPER, LOWER} from '@miners/constants/thresholdTypes';

describe('Define if the status circle is yellow', () => {
    test('it should return true (is yellow) with upper threshold', () => {
        expect(isYellow(UPPER, 1.01, 0)).toEqual(true);
        expect(isYellow(UPPER, "1.01", "0")).toEqual(true);
        expect(isYellow(UPPER, 1.01, "0")).toEqual(true);
        expect(isYellow(UPPER, "1.01", 0)).toEqual(true);
    });
    test('it should return false (is not yellow, is green) with upper threshold', () => {
        expect(isYellow(UPPER, -1.01, 0)).toEqual(false);
        expect(isYellow(UPPER, "-1.01", "0")).toEqual(false);
        expect(isYellow(UPPER, -1.01, "0")).toEqual(false);
        expect(isYellow(UPPER, "-1.01", 0)).toEqual(false);
    });
    test('it should return true (is yellow) with lower threshold', () => {
        expect(isYellow(LOWER, -1.01, 0)).toEqual(true);
        expect(isYellow(LOWER, "-1.01", "0")).toEqual(true);
        expect(isYellow(LOWER, -1.01, "0")).toEqual(true);
        expect(isYellow(LOWER, "-1.01", 0)).toEqual(true);
    });
    test('it should return false (is not yellow, is green) with lower threshold', () => {
        expect(isYellow(LOWER, 1.01, 0)).toEqual(false);
        expect(isYellow(LOWER, "1.01", "0")).toEqual(false);
        expect(isYellow(LOWER, 1.01, "0")).toEqual(false);
        expect(isYellow(LOWER, "1.01", 0)).toEqual(false);
    });
    test('it should return true when value = threshold', () => {
        expect(isYellow(LOWER, 1, 1)).toEqual(true);
        expect(isYellow(UPPER, 1, 1)).toEqual(true);
    });
    test('it should return null (the threshold type is invalid)', () => {
        expect(isYellow('gvhnjuh', 1.01, 0)).toEqual(null);
    });
})
