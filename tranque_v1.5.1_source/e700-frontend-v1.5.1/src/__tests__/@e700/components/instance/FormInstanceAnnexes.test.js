import React from 'react';
import ReactDOM from 'react-dom';

import FormInstanceAnnexes from '@e700/components/instance/FormInstanceAnnexes';


describe('FormInstanceAnnexes component', () => {

    test.skip('it renders without crashing', () => {
        const div = document.createElement('div');
        const mockAnnexesProps = {
            form: {
                id: 'gLR8lHBvU4GGMnbIrSA_Sw',
                version_schema: {
                    steps: {
                        0: {title: 'Faena'},
                        1: {title: 'Depósito'},
                        2: {title: 'Relaves'},
                        3: {title: 'Muros'}
                    }
                },
                target_name: 'El mauro', target_canonical_name: 'el-mauro'
            },
            answer: {1: 'asdf', 2: '12334354', 3: 'dsffgh', 4: '6346436', 5: 'arrendada'},
            answer_started: true,
            comment: null,
            created_at: '2019-06-03T21:39:16.953730Z',
            end_date: '2019-06-30T04:00:00Z',
            id: 'gLR8lHBvU4GGMnbIrSA_Sw',
            sent_at: null,
            sent_by: null,
            start_date: '2019-06-10T04:00:00Z',
            state: 'answer_received',
            target: 'JB_mMy-yWF22c3j_yjfo2g',
            target_canonical_name: 'el-mauro',
            documents: [],
            target_name: 'El mauro',
            updated_at: '2019-06-04T18:52:34.225335Z',
            version: 'cM0Sz79MU_ORXQfR9vx5cQ',
            version_schema: {title: 'E700'}
        };
        ReactDOM.render(<FormInstanceAnnexes {...mockAnnexesProps}/>, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
