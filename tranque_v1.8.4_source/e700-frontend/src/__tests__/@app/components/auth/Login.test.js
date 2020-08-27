import React from 'react';
import {cleanup, fireEvent, render} from '@testing-library/react';

import Login from '@app/components/auth/Login';

import {history} from '@app/history';

import {of} from 'rxjs';
import {reverse} from '@app/urls';

afterEach(cleanup);

beforeEach(() => {
    jest.resetAllMocks();
});

const LOGIN_BTN_TEXT = 'Iniciar sesión';

describe.skip('Login component', () => {

    test('it renders an access to login', () => {
        // Act
        const {getByText} = render(<Login/>);
        // Assert
        const textEl = getByText(LOGIN_BTN_TEXT);
        expect(textEl).toBeDefined();
    });

    test('it should update state with user credentials on input changes', () => {
        // Arrange:
        // Form with empty entries --> component state is empty (assert)
        const {getByLabelText} = render(<Login/>);
        const usernameInput = getByLabelText('Usuario');
        const passwordInput = getByLabelText('Contraseña');
        // Arrange expected user and password values
        const user = {username: 'user', password: 'test'};
        // Check initial values in the form
        expect(getByLabelText('Usuario').value).toEqual('');
        expect(getByLabelText('Contraseña').value).toEqual('');

        // Act:
        // Add user and password values in the form
        fireEvent.change(usernameInput, {target: {value: user.username}});
        fireEvent.change(passwordInput, {target: {value: user.password}});

        // Assert:
        // Check expected credentials from the input values (related to the state)
        expect(getByLabelText('Usuario').value).toEqual(user.username);
        expect(getByLabelText('Contraseña').value).toEqual(user.password);
    });

    test('it should be able to hide or show the password input', () => {
        // Arrange:
        const {container} = render(<Login/>);
        // Identify the button to toggle the password visibility
        const showPasswordButton = container.querySelector(
            '#visibility-password-button');
        // Act and Assert:
        // By default, the password should be hidden
        expect(container.querySelector('#hidden-password')).toBeDefined();
        expect(container.querySelector('#visible-password')).toBeNull();
        // After click the visibility button, the user should be able to see the password
        fireEvent.click(showPasswordButton);
        expect(container.querySelector('#hidden-password')).toBeNull();
        expect(container.querySelector('#visible-password')).toBeDefined();
    });

    test('it should make a login request after click on submit button', () => {
        // Arrange:
        const mockCallBack = jest.fn(() => of({data: {}}));
        const mockLoginAction = {login: mockCallBack, logout: jest.fn()};
        const {getByText, getByLabelText} = render(<Login actions={mockLoginAction}/>);
        const usernameInput = getByLabelText('Usuario');
        const passwordInput = getByLabelText('Contraseña');
        const loginElement = getByText(LOGIN_BTN_TEXT);
        const user = {username: 'user', password: 'test'};
        fireEvent.change(usernameInput, {target: {value: user.username}});
        fireEvent.change(passwordInput, {target: {value: user.password}});
        // Act:
        fireEvent.click(loginElement);
        // Assert:
        expect(loginElement).toBeDefined();
        expect(mockCallBack).toHaveBeenCalledTimes(1);
    });

    test('it should redirect the user to home if is authenticated', async () => {
        // Arrange:
        const mockRequest = of({data: {}});
        const mockCallBack = jest.fn(() => mockRequest);
        const mockLoginAction = {login: mockCallBack, logout: jest.fn()};
        const mockHistoryPush = jest.fn();
        history.push = mockHistoryPush;
        const {getByText} = render(
            <Login
                actions={mockLoginAction}
                isAuthenticated={true}
                history={history}
            />);
        // Act:
        const loginElement = getByText(LOGIN_BTN_TEXT);
        fireEvent.click(loginElement);
        // Assert:
        await mockRequest;
        expect(mockCallBack).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith(reverse('home'));
    });

});
