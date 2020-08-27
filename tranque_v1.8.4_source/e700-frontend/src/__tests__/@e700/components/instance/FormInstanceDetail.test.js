import React from 'react';
import ReactDOM from 'react-dom';
import {cleanup} from '@testing-library/react';

import FormInstanceDetail from '@e700/components/instance/FormInstanceDetail';

afterEach(cleanup);

beforeEach(() => {
    jest.resetAllMocks();
});


it.skip('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<FormInstanceDetail/>, div);
    ReactDOM.unmountComponentAtNode(div);
});


test.skip(
    `GIVEN a user entered to the form,
  WHEN the user tries to complete a field with letters
  THEN nothing is written in the field`, () => {
        // mocks siempre antes de que se necesiten

        // const form = render(<FormInstanceDetail/>); //Primero renderear el formulario, entrar en él. DOM falso
        // form.debug()
        // fireEvent.click(form.getByLabelTest("{label}"))
        // fireEvent.click(form.getByTestId('freetext-oneline')); //buscar el label junto a la caja de texto
    });

test.skip(
    `GIVEN a user entered to the form,
  WHEN the user tries to complete a field with numbers
  THEN the field is completed accordingly`, () => {

    });
