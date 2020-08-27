import {actions} from '../@alerts_events/data/actions';

export function getUser(attrs, userActions) {
    return {
        username: '[Nombre de usuario]',
        firstName: '[Primer nombre de usuario]',
        lastName: '[Apellido del usuario]',
        email: 'user@mail.cl',
        groups: ['authority', 'mine'],
        profile: {
            targets: [],
            all_actions: userActions || actions
        },
        ...attrs
    }
}

