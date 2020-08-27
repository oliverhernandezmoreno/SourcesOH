const fs = require('fs');
const path = require('path');

let branch = null;
let commit = null;
try {
    const head = fs.readFileSync(path.join(__dirname, '..', '.git', 'HEAD'))
        .toString()
        .trim();
    if (!head.startsWith('ref: ')) {
        commit = head;
    } else {
        branch = head.split('/').reverse()[0];
        commit = fs.readFileSync(path.join(__dirname, '..', '.git', head.split(' ')[1]))
            .toString()
            .trim();
    }
} catch (_) {
    // pass
}

const package = require(path.join(__dirname, '../package.json'));
fs.writeFileSync(
    path.join(__dirname, '../package.json'),
    JSON.stringify({...package, commit, branch}, null, 2)
);
