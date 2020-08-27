import {actions} from '../@alerts_events/data/actions';

export function getUser(attrs, userActions) {
    return {
        username: '[Nombre de usuario]',
        firstName: '[Primer nombre de usuario]',
        lastName: '[Apellido del usuario]',
        email: 'user@mail.cl',
        groups: ['authority', 'mine'],
        global_permissions: userActions || actions,
        profile: {targets: []},
        ...attrs
    }
}

