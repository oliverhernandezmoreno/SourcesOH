import {getThresholdValue, getCommonThresholds} from '@miners/containers/EF/dashboard/ParamStatusContainer';
import {UPPER, LOWER} from '@miners/constants/thresholdTypes';

function getThreshold(upper, lower, kind) {
    return {[UPPER]: upper, [LOWER]: lower, kind};
}

const thresholds = [
    getThreshold("2", 3, null),
    getThreshold(4, 5, null),
    getThreshold(6, 'tfvh', null),
    getThreshold('cvre', 5, null),
    getThreshold('', '', null),
    getThreshold(null, null, null),
    getThreshold(8, "9", null)
];

const threshold_kind_test = [
    getThreshold(2, 3, 'crfvfr'),
    getThreshold(4, 5, null),
    getThreshold(6, 7, 'crftrg'),
    getThreshold(8, 9, null)
]

const invalid_thresholds = [null, 'thbfj', null];

describe('Get a threshold value according to the threshold type', () => {
    test('it should return upper value 2', () => {
        expect(getThresholdValue(thresholds, UPPER)).toEqual(2);
    });
    test('it should return lower value 9', () => {
        expect(getThresholdValue(thresholds, LOWER)).toEqual(9);
    });
    test('it should return null, because of an invalid threshold type', () => {
        expect(getThresholdValue(thresholds, 'jnuyg')).toEqual(null);
    });
});

describe('Get a thresholds with kind=null (common thresholds)', () => {
    test('it should return an array with 2 thresholds', () => {
        expect(getCommonThresholds(threshold_kind_test).length).toEqual(2);
    });
    test('it should return an empty array', () => {
        expect(getCommonThresholds(invalid_thresholds).length).toEqual(0);
    });
});
