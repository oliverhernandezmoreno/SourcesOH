import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import DescriptionSection from '@alerts_events/components/ticket/detail/DescriptionSection';
import {getTicket, ticket} from './data/Ticket';
import { EXCEED, BY_USER, DELAY, COMBINE, DEFORMATIONS, EARTHQUAKE } from '@alerts_events/constants/ticketReasons';
import { A, B, YELLOW_ALERT, RED_ALERT, CLOSED, getGroup } from '@alerts_events/constants/ticketGroups';
import { CREATE, COMMENT, DOCUMENT, CLOSE, ESCALATE, ARCHIVE, EVALUABLE } from '@alerts_events/constants/logTypes';
import { APPROVED, DENIED } from '@alerts_events/constants/authorizationStates';
import { getUser } from 'stories/data/User';
import { TICKET_MANAGER, ALERT_BACKGROUND, ALERT_TRACING, CLOSING_ACT } from '@alerts_events/constants/commentTypes';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

const document = {
    created_at: "2020-03-20T15:45:00.933438Z",
    description: null,
    id: "imDdfQaOVNeZdM-J4LQ_6w",
    meta: {comment: {value: 10}},
    name: "FlujoComunidades1.png",
    uploaded_by: "Usuario_minera_1",
}

const log = {
    author: {
        email: "min_1@mail.cl",
        first_name: "",
        groups: ["mine"],
        last_name: "",
        profile: {},
        username: "Usuario_minera_1"
    },
    created_at: "2020-03-20T12:09:52.399300Z",
    documents: [],
    highlight: false,
    id: "ojLhiTb9VzSyguRRaroKYQ",
    meta: {},
    ticket: "UlNia-u5WA6MMZoorpiCfQ",
    timeseries: null
}

function getLog(log_type) {
    let meta;
    let documents = [];
    let author = log.author;
    switch (log_type) {
        case 'create':
            meta = {
                description: CREATE
            };
            break;
        case 'comment':
            meta = {
                comment_type: "event_management",
                comment: "Esto es el contenido de un comentario",
                comment_id: 1,
                description: COMMENT
            };
            break;
        case 'document':
            meta = {
                comment_id: 1,
                description: DOCUMENT
            };
            documents = [document];
            break;
        case 'more_documents':
            meta = {
                comment_id: 2,
                description: DOCUMENT
            };
            documents = [document];
            break;
        case 'close':
            meta = {
                next_state: CLOSED,
                previous_state: A,
                description: CLOSE
            };
            break;
        case 'escalate':
            meta = {
                description: ESCALATE,
                next_state: A,
                previous_state: B
            };
            break;
        case 'unescalate':
            meta = {
                description: ESCALATE,
                next_state: YELLOW_ALERT,
                previous_state: RED_ALERT
            };
            break;
        case 'archive':
            meta = {
                description: ARCHIVE,
                previous_archived: false,
                next_archived: true
            };
            break;
        case 'unarchive':
            meta = {
                description: ARCHIVE,
                previous_archived: true,
                next_archived: false
            };
            break;
        case 'not_evaluable':
            author = {}
            meta = {
                description: EVALUABLE,
                previous_evaluable: true,
                next_evaluable: false
            };
            break;
        case 'evaluable':
            author = {}
            meta = {
                description: EVALUABLE,
                previous_evaluable: false,
                next_evaluable: true
            };
            break;
        case 'request':
            author = {};
            meta = {
                description: "request",
                authorization: 'ticket.C.archive.authorization.authority-2',
            }
            break;
        case 'authorization':
            author = {}
            meta = {
                description: "authorization",
                authorization: 'ticket.C.archive.authorization.authority-2',
                comment: '',
                status: APPROVED
            }
            break;
        case 'authorization_comment_docs':
            author = {}
            meta = {
                description: "authorization",
                authorization: 'ticket.C.archive.authorization.authority-2',
                comment: 'Comentario de prueba',
                status: DENIED
            }
            documents = [document];
            break;
        default: meta = {};
    }
    return {...log, documents, meta, author};
}

function getCommentLog(type, comment, comment_id) {
    const meta = {
        comment_type: type,
        comment: comment,
        comment_id: comment_id,
        description: COMMENT
    };
    return {...log, meta};
}

function getDocumentLog(comment_id) {
    const meta = {
        comment_id: comment_id,
        description: DOCUMENT
    };
    return {...log, documents: [document], meta};
}

const logs = [
    getLog('create'),
    getLog('comment'),
    getLog('document'),
    getLog('more_documents'),
    getLog('more_documents'),
    getLog('more_documents'),
    getLog('close'),
    getLog('escalate'),
    getLog('unescalate'),
    getLog('archive'),
    getLog('unarchive'),
    getLog('not_evaluable'),
    getLog('evaluable'),
    getLog('request'),
    getLog('authorization'),
    getLog('authorization_comment_docs')
];

const commentLogs = [
    getCommentLog(TICKET_MANAGER, 'Comentario de reporte de gestión', 1),
    getDocumentLog(1),
    getCommentLog(ALERT_BACKGROUND, 'Comentario de antecedentes de alerta', 2),
    getDocumentLog(2),
    getCommentLog(ALERT_TRACING, 'Comentario de seguimiento de alerta', 3),
    getDocumentLog(3),
    getCommentLog(CLOSING_ACT, 'Comentario de acta de cierre', 4),
    getDocumentLog(4)
]

const group = getGroup(ticket);

const allCommentsreader = getUser({}, [
    {name: 'ticket.' + group + '.' + TICKET_MANAGER + '_comment.read', description: ''},
    {name: 'ticket.' + group + '.' + ALERT_BACKGROUND + '_comment.read', description: ''},
    {name: 'ticket.' + group + '.' + ALERT_TRACING + '_comment.read', description: ''},
    {name: 'ticket.' + group + '.' + CLOSING_ACT + '_comment.read', description: ''},
]);
const ticketManagerReader = getUser({}, [
    {name: 'ticket.' + group + '.' + TICKET_MANAGER + '_comment.read', description: ''}
]);
const alertTracingReader = getUser({}, [
    {name: 'ticket.' + group + '.' + ALERT_TRACING + '_comment.read', description: ''}
]);

function getDescriptionSection(reason, parameter, logs, user) {
    return (<div style={divStyle}>
        <DescriptionSection
            ticket={getTicket({
                result_state: {...ticket.result_state, reason, parameter}
            })}
            logs={logs}
            onDownload={() => {}}
            onAuthorizationDownload={() => {}}
            user={user}
        />
    </div>);
}


storiesOf('Alerts&Events/ticket-detail/DescriptionSection/Deformations', module)
    .addDecorator(muiTheme([theme]))
    .add('Exceed', () => getDescriptionSection(EXCEED, DEFORMATIONS, [], null))
    .add('ByUser', () => getDescriptionSection(BY_USER, DEFORMATIONS, [], null))
    .add('Delay', () => getDescriptionSection(DELAY, DEFORMATIONS, [], null))
    .add('Combine', () => getDescriptionSection(COMBINE, DEFORMATIONS, [], null))


storiesOf('Alerts&Events/ticket-detail/DescriptionSection/Earthquake', module)
    .addDecorator(muiTheme([theme]))
    .add('Exceed', () => getDescriptionSection(EXCEED, EARTHQUAKE, [], null))
    .add('ByUser', () => getDescriptionSection(BY_USER, EARTHQUAKE, [], null))
    .add('Delay', () => getDescriptionSection(DELAY, EARTHQUAKE, [], null))
    .add('Combine', () => getDescriptionSection(COMBINE, EARTHQUAKE, [], null))


storiesOf('Alerts&Events/ticket-detail/DescriptionSection/Logs', module)
    .addDecorator(muiTheme([theme]))
    .add('Examples', () => getDescriptionSection(EXCEED, EARTHQUAKE, logs, null))
    .add('Comments seen by a user with all reading permissions', () =>
        getDescriptionSection(EXCEED, EARTHQUAKE, commentLogs, allCommentsreader))
    .add('Comments seen by a user with only ticket manager reading permission', () =>
        getDescriptionSection(EXCEED, EARTHQUAKE, commentLogs, ticketManagerReader))
    .add('Comments seen by a user with only alert tracing reading permission', () =>
        getDescriptionSection(EXCEED, EARTHQUAKE, commentLogs, alertTracingReader))
