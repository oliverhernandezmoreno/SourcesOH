import React from 'react';
import {shallow} from 'enzyme/build';
import {Routes} from '@e700/Routes';
import {Route} from 'react-router';
import PrivateRoute from '@app/containers/auth/PrivateRoute';
import C40X from '@app/components/utils/C40X';

/**
 * Map to manage public routes
 */
let pathMap = {};

/**
 * Map to manage private routes
 */
let privatePathMap = {};

/**
 * List to manage the known app paths
 */
let appPaths = [];

describe('Routes ', () => {

    beforeAll(() => {
        // Arrange:
        // E700 Routes
        const wrapper = shallow(<Routes/>);
        // Get all the public routes
        pathMap = wrapper
            .find(Route)
            .reduce((pathMap, route) => {
                const routeProps = route.props();
                pathMap[routeProps.path] = routeProps.component;
                return pathMap;
            }, {});
        // Get all the private routes
        privatePathMap = wrapper
            .find(PrivateRoute)
            .reduce((pathMap, route) => {
                const routeProps = route.props();
                pathMap[routeProps.path] = routeProps.component;
                return pathMap;
            }, {});
        // List of known paths for the app
        appPaths = Object.keys(pathMap).concat(Object.keys(privatePathMap));
    });

    it("shouldn't be empty of routes", () => {
        expect(appPaths.length).toBeGreaterThan(0);
    });

    it('should redirect to the 404 component if path is not known', () => {
        // Act and assert
        expect(pathMap[undefined]).toBe(C40X);
    });

});
