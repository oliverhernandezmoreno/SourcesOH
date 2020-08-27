#!/usr/bin/env bash

set -e

# __VARIABLE__:__NAME__
vars=(
    'al:Al'
    'as:As'
    'be:Be'
    'b:B'
    'cd:Cd'
    'ce:CE'
    'chloride:Cl'
    'co:Co'
    'cr:Cr'
    'cu:Cu'
    'cyanide:CN'
    'fe:Fe'
    'fluoride:F'
    'hg:Hg'
    'mn:Mn'
    'mo:Mo'
    'ni:Ni'
    'pb:Pb'
    'ph:pH'
    'sb:Sb'
    'se:Se'
    'sulfates:SO4'
    'zn:Zn'
)

for vartuple in "${vars[@]}"
do
    IFS=: read -r var name <<< "$vartuple"

    sed -e "s/__VARIABLE__/$var/g" \
        -e "s/__NAME__/$name/g" \
        < valid-variable.template \
        > "${var}.yml"
done
