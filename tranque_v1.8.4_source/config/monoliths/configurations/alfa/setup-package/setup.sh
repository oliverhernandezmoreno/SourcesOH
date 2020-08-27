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
/usr/src/app/manage.py shell <<EOF
import random
from entities.models import WorkSite
from targets.models import Target
worksite = WorkSite.objects.all()[random.randint(0, WorkSite.objects.count() - 1)]
target, _ = Target.objects.update_or_create(
    canonical_name="amtc-ficticio",
    defaults={
        "name": "AMTC ficticio",
        "type_id": "tranque-de-relave",
        "state_id": "activo",
        "meta": {"name": {"value": "AMTC ficticio", "name": "Nombre"}}
    }
)
target.work_sites.add(worksite)
EOF
/usr/src/app/manage.py tallytargets
/usr/src/app/manage.py createcurrentremote

# Mark it done
date --iso-8601=seconds > /configuration-state/configured
echo "Finished stack configuration"
