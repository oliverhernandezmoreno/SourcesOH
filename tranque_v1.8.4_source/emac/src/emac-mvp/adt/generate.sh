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
        < arima.template \
        > "arima/variables.${var}.yml"

    sed -e "s/__VARIABLE__/$var/g" \
        -e "s/__NAME__/$name/g" \
        < arima-status.template \
        > "status/variables.${var}.yml"
done

# __VARIABLE__:__NAME__
sgt=(
    'ce:CE'
    'nf:NF'
    'orp:ORP'
    'ph:pH'
    't:Temperatura'
)

for vartuple in "${sgt[@]}"
do
    IFS=: read -r var name <<< "$vartuple"

    sed -e "s/__VARIABLE__/$var/g" \
        -e "s/__NAME__/$name/g" \
        < arima.sgt.template \
        > "arima/sgt.${var}.yml"

    sed -e "s/__VARIABLE__/$var/g" \
        -e "s/__NAME__/$name/g" \
        < arima-status.sgt.template \
        > "status/sgt.${var}.yml"
done
