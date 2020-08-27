#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "[tests] Starting API service"
Rscript --vanilla /app/index.R &
service=$!

function stopservice {
    echo "[tests] Stopping API service"
    kill $service
    wait
}

trap stopservice EXIT

while ! nc -z localhost 5000
do
    echo "[tests] Waiting for API service"
    sleep 1
done

echo "[tests] Starting test run"
find "$DIR/suites" -type f | grep -v "~" | sort | while read -r testscript
do
    echo "[tests] Running ${testscript}"
    bash "${testscript}"
done
echo "[tests] Done"
