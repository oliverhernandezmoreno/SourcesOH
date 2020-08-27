#!/usr/bin/env bash

set -e

targets=(
    'dep01'
    'dep02'
    'dep03'
    'dep04'
    'dep05'
    'dep06'
    'dep07'
    'dep08'
    'dep09'
    'dep10'
    'dep11'
    'dep12'
    'dep13'
    'dep14'
    'dep15'
    'dep16'
    'dep17'
    'dep18'
    'dep19'
    'dep20'
    'dep21'
    'dep22'
    'dep23'
    'dep24'
    'dep25'
    'dep26'
    'dep27'
    'dep28'
    'dep29'
    'dep30'
    'dep31'
    'dep32'
    'dep33'
    'dep34'
    'dep35'
    'dep36'
    'dep37'
    'dep38'
    'dep39'
    'dep40'
)

for target in "${targets[@]}"
do
    sed -e "s/__REPLACED_TARGET__/${target}/g" \
        < faking-behaviour.json.template \
        > "behaviours/faking-behaviour.${target}.json"
done
