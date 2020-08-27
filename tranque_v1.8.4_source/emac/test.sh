#!/usr/bin/env bash

dir=$(pwd)
if test -d build
then
    rm -r build
fi
./build.sh
./install.sh
cat "build/$(basename $dir).manifest"
echo
