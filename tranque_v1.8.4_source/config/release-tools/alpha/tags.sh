#!/bin/sh

# Example: ./tags.sh v1.8.0 v1.0.0 v1.0.1 v1.0.2 v1.2.0 v1.1.0 v1.2.1 v1.0.2 v1.2.0 dev 2020-07-23_21-16-36

echo "Tagging Release ${1} in https://gitlab.com/Inria-Chile/tranque..."

./create-tag-frontend.sh ${1} ${2} ${10} ${11}
./create-tag-backend.sh ${1} ${3} ${10} ${11}
./create-tag-enrichment.sh ${1} ${4} ${10} ${11}
./create-tag-stream-snapshot.sh ${1} ${5} ${10} ${11}
./create-tag-beats-consumer.sh ${1} ${6} ${10} ${11}
./create-tag-stats.sh ${1} ${7} ${10} ${11}
./create-tag-archivist.sh ${1} ${8} ${10} ${11}
./create-tag-config.sh ${1} ${9} ${10} ${11}

echo "Tagging of Release ${1} was done."
