#!/bin/sh

# Example: ./create-tag-stream-snapshot.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36

echo ""
echo "Tagging stream-snapshot ${2} from ${3}..."
cd ../../../stream-snapshot
git pull
git checkout ${3}
git pull
git merge dev --no-verify
git push origin ${3}
git tag -a ${2} -m "Version ${2} Fecha de Entrega: ${4} Version Plataforma ${1}"
git push origin ${2}
git show ${2}
echo "Tagging of stream-snapshot ${2} was done."
