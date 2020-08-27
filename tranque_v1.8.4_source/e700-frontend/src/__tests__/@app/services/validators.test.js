import {validators} from '@app/services';

describe('validators.isRUT', () => {
    it('Validates valid ruts', () => {
        expect(validators.isRUT(true)('16.465.771-k')).toBeTruthy();
        expect(validators.isRUT(true)('16.465771-k')).toBeTruthy();
        expect(validators.isRUT(true)('16.605.462-1')).toBeTruthy();
        expect(validators.isRUT(true)('16605462-1')).toBeTruthy();
        expect(validators.isRUT(false)('65058044-3')).toBeFalsy();
        expect(validators.isRUT(true)('16.605.4621')).toBeTruthy();
        expect(validators.isRUT(true)('')).toBeTruthy();
    });
    it('Invalidates invalid ruts', () => {
        expect(validators.isRUT(true)('16.605.462-2')).toBeFalsy();
        expect(validators.isRUT(true)('16465771-8')).toBeFalsy();
        expect(validators.isRUT(true)(65058043)).toBeFalsy();
    });
});
