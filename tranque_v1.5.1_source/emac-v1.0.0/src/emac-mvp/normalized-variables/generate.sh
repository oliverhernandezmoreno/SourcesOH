#!/usr/bin/env bash

set -e

# __NORM__:__NORM_NAME__
norms=(
    'riego:Riego'
    'agua-potable:Agua Potable'
    'vida-acuatica:Vida Acuática'
    'recreacion:Recreación'
    'ii:Impacto'
)

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

for normtuple in "${norms[@]}"
do
    IFS=: read -r norm normname <<< "$normtuple"

    sed -e "s/__NORM__/$norm/g" \
        < normalization.js.template \
        > "normalization-${norm}.js"

    for vartuple in "${vars[@]}"
    do
        IFS=: read -r var name <<< "$vartuple"

        sed -e "s/__VARIABLE__/$var/g" \
            -e "s/__NAME__/$name/g" \
            -e "s/__NORM__/$norm/g" \
            -e "s/__NORM_NAME__/$normname/g" \
            < normalized-variable.template \
            > "${norm}/${var}.yml"
    done
done
