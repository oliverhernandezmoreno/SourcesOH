import {RESIZE_WINDOW} from '@communities/actions';

import resizeWindowReducer, {initialState} from '@communities/reducers/resizeWindow';

describe('return default state ', () => {

    it('Return the initial state by default', () => {
        // Arrange:
        const action = {};
        // Act:
        const state = resizeWindowReducer(undefined, action);
        // Assert:
        expect(state).toEqual(initialState);
    });

    it('Change store value', () => {
        // Arrange:
        const mockPreviousState = {
            widthPage: 20
        };
        const prevState = resizeWindowReducer(mockPreviousState, {});
        expect(prevState).toEqual(mockPreviousState);
        const action = {type: RESIZE_WINDOW};
        // Act:
        const state = resizeWindowReducer(mockPreviousState, action);
        // Assert:
        expect(state).toEqual(initialState);
    });

});
