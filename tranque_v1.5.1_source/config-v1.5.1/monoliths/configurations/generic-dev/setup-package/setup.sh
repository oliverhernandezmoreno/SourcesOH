#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if [ -f /configuration-state/configured ]
then
    echo "Stack is already configured"
    exit 0
fi

/usr/src/app/manage.py loadzones
/usr/src/app/manage.py loadtargets2019
/usr/src/app/manage.py tallytargets
/usr/src/app/manage.py createcurrentremote

# Mark it done
date --iso-8601=seconds > /configuration-state/configured
echo "Finished stack configuration"
