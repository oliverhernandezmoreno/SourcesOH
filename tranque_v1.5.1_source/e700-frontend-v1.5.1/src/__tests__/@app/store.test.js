import {configurePersistentStore} from '@app/store';

describe('configurePersistentStore ', () => {
    it('should return a store and a persistor objects, based on the app reducers', () => {
        // Arrange:
        const expectedPersistorMethods = [
            'purge', 'flush', 'pause', 'persist'
        ];
        // Act:
        const {store, persistor} = configurePersistentStore();
        // Assert:
        expect(Object.keys(store)).toEqual(
            expect.not.arrayContaining(expectedPersistorMethods)
        );
        expect(Object.keys(persistor)).toEqual(
            expect.arrayContaining(expectedPersistorMethods)
        );
    });
});
