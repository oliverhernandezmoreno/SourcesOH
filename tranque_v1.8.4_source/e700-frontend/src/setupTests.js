import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-canvas-mock';

// Enzyme configuration
Enzyme.configure({adapter: new Adapter()});

/**
 * Mock localStorage
 */
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) {
            return store[key] || null;
        },
        setItem: function (key, value) {
            store[key] = value.toString();
        },
        removeItem: function (key) {
            delete store[key];
        },
        clear: function () {
            store = {};
        },
        getStore() {
            return store;
        },
        isMock() {
            return true;
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});
