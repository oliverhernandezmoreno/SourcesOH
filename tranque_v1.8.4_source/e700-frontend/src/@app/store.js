import {applyMiddleware, createStore} from 'redux';
import {persistReducer, persistStore} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import rootReducer from '@app/reducers';

/**
 * Regular store configuration
 */
export function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk)
    );
}

/**
 * Redux persist store configuration
 */
export function configurePersistentStore(initialState) {
    const persistConfig = {
        key: 'root',
        storage
    };
    const persistedReducer = persistReducer(
        persistConfig, rootReducer
    );
    const store = createStore(
        persistedReducer,
        initialState,
        applyMiddleware(thunk)
    );
    const persistor = persistStore(store);
    return {store, persistor};
}

/**
 * Application store
 */
export const {store, persistor} = configurePersistentStore();
export default store;
