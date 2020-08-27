#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

while ! node -<<EOF
require("${DIR}/../lib/backend/models")
  .sequelize
  .authenticate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
EOF
do
    echo "[setup-postgres.sh] Waiting for postgres"
    sleep 3
done

yarn setup-db sync
yarn setup-db load "${DIR}/test-fixture.json"
