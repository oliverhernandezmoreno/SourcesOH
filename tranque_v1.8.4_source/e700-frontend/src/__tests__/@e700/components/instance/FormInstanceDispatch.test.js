import React from 'react';
import ReactDOM from 'react-dom';

import FormInstanceDispatch from '@e700/components/instance/FormInstanceDispatch';


describe('FormInstanceDispatch component', () => {

    test('it renders without crashing', () => {
        const div = document.createElement('div');
        const mockProps = {
            newFiles: {},
            schema:
                {steps: []},
            answers: {},
            documents: [{
                created_at: '2019-08-12T18:41:28.672140Z',
                description: null,
                id: 'QaFSyzDGXP6ZpGWnBNEe9g',
                meta: {
                    annex: {
                        value: 'anexo1'
                    }
                },
                name: 'resumen-info E700.docx'
            }]
        };
        ReactDOM.render(<FormInstanceDispatch {...mockProps}/>, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
