import {getUser} from './User';

export function getDocuments(number, meta, attrs) {
    let docs = [];
    for (var i=0; i < number; i++) {
        docs.push({
            created_at: '2020-05-05T16:28:56.591454Z',
            id: 'fuD2_jGnV9SEoaMguVaNCg',
            meta: meta,
            name: 'archivo.txt',
            uploaded_by: getUser({}, null),
            ...attrs
        })
    }
    return docs;
}
