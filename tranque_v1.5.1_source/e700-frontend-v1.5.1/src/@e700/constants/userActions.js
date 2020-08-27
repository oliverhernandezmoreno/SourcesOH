import {getUserPerms} from '@app/permissions';

//actions to miner user
export function canEditForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.edit'));
}

export function canValidateForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.validate'));
}

export function canSendForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.send'));
}

export function canReadForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.read'));
}

export function canRequestEditForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.request'));
}

//actions to authority user
export function canAssingForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.create'));
}

export function canReviewForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.review'));
}

export function canAddFormObservations(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.comment'));
}

export function canCreateFormCase(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.case.create'));
}

export function canUpdateFormCase(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.case.update'));
}

export function canAddFormCaseObs(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.case.comment'));
}

export function canResendForm(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.resend'));
}

export function canResolveFormRequest(user) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('reportforms.form.request.update'));
}

function getActions(user) {
    return getUserPerms(user, true);
}
