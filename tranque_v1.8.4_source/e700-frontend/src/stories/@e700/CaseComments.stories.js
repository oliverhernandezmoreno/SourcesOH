import React from 'react';
import theme from '@e700/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import CaseComments from '@e700/components/registry/CaseComments';


const comments = [
    {
        content: "Comentario de prueba",
        created_at: "2020-01-27T12:56:25.666617Z",
        created_by: "Usuario de Prueba",
        id: 0,
        updated_at: "2020-01-27T12:56:25.666660Z"
    },
    {
        content: "Comentario sin usuario (usuario: null o comentario automático)",
        created_at: "2020-01-27T12:56:25.666617Z",
        created_by: null,
        id: 1,
        updated_at: "2020-01-27T12:56:25.666660Z"
    },
    {
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
                 "In quis neque risus. Nunc sit amet rutrum tortor. " +
                 "Mauris porta massa in mauris feugiat, eu laoreet ipsum fringilla. " +
                 "Ut ac dignissim quam. Cras cursus aliquam pretium. " +
                 "Maecenas justo odio, porttitor ac odio quis, fermentum aliquam eros. " +
                 "Nulla blandit erat ut nibh sodales aliquet. Phasellus feugiat nisl non efficitur tincidunt. " +
                 "Aliquam viverra enim risus, commodo vehicula ante ullamcorper vitae. " +
                 "In finibus auctor nisi, sit amet efficitur dolor vestibulum vitae. " +
                 "Cras scelerisque justo purus, sit amet posuere nisi bibendum at. " +
                 "Fusce ac lacus accumsan ex ornare accumsan. " +
                 "Nulla ligula nisl, tincidunt in finibus ultrices, gravida eget ex.\n\n" +

                 "Vivamus vehicula quis sapien ut blandit. Donec sit amet aliquam nisl. " +
                 "Vestibulum elementum erat massa, non ultricies massa accumsan ut. Ut ac bibendum nunc. " +
                 "Suspendisse viverra sed ex vitae facilisis. " +
                 "Duis urna lorem, rutrum ut ante nec, blandit laoreet purus. " +
                 "Quisque scelerisque tincidunt lectus a lacinia. Nulla tempus mi at blandit lacinia. " +
                 "Curabitur sed urna tortor. Proin nisl arcu, rhoncus sed placerat luctus, tempor id nisi. " +
                 "Ut commodo urna lorem, eget dictum velit convallis ut.",
        created_at: "2020-01-27T12:56:25.666617Z",
        created_by: "Usuario Blabla",
        id: 2,
        updated_at: "2020-01-27T12:56:25.666660Z"
    },
    {
        content: "Comentario de prueba con un archivo adjunto",
        created_at: "2020-01-27T12:56:25.666617Z",
        created_by: "Usuario de Prueba",
        id: 3,
        updated_at: "2020-01-27T12:56:25.666660Z"
    },
    {
        content: "Comentario de prueba con varios archivos adjuntos",
        created_at: "2020-01-27T12:56:25.666617Z",
        created_by: "Usuario de Prueba",
        id: 4,
        updated_at: "2020-01-27T12:56:25.666660Z"
    },
];

function getFilesForAcomment(commentID, number) {
    let files = [];
    for(var i = 0; i < number; i ++) {
        files.push(
            {
                created_at: "2020-01-28T13:35:06.361651Z",
                description: null,
                id: "PtMmAzvCVcOIm_x1BMd4hg",
                meta: {comment: {value: commentID}},
                name: "Documento de prueba.txt",
                uploaded_by: "Usuario de Prueba"
            }
        )
    }
    return files;
}

const files = [
    {
        created_at: "2020-01-28T13:35:06.361651Z",
        description: null,
        id: "PtMmAzvCVcOIm_x1BMd4hg",
        meta: {comment: {value: 3}},
        name: "Documento de prueba.txt",
        uploaded_by: "Usuario de Prueba"
    }
]

storiesOf('e700/Case Comments', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => (
        <CaseComments comments={comments}
            onSend={() => {}}
            files={[...files, ...getFilesForAcomment(4, 5)]}
            onDownload={(doc) => () => {}}
        />
    ))



