import React from 'react';
import FormInstanceAnnexes from '@e700/components/instance/FormInstanceAnnexes';

export default {
    component: FormInstanceAnnexes,
    title: 'e700/Form Instance Annexes',
};

const form = {
    answer: {},
    answer_started: true,
    comment: null,
    created_at: "2020-01-29T19:14:12.083597Z",
    documents: [],
    id: "_viPAMyCUUKyck5XsFSKPw",
    period: "2029 - Trimestre 1",
    received_at: null,
    sent_at: null,
    sent_by: null,
    state: "open",
    target: "EXe7CL-JWPWQN_FnFypA5Q",
    target_canonical_name: "el-mauro",
    target_name: "El mauro",
    trimester: 1,
    updated_at: "2020-01-29T20:38:07.020458Z",
    version: "qOxF7KC1UG6JvZ5Fnn9mWg",
    version_schema: {},
    work_sites: [],
    year: 2029,
    zone: {}}

const annexesProps = {
    form: form,
    uploadFiles: () => {},
    newFiles: {},
    deleteFile: (doc) => {}
};

export const form_instance_annexes = () => <FormInstanceAnnexes {...annexesProps}/>;
