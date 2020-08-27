#!/usr/bin/env bash

set -e

tar xzv -C "${1:-.}" < "${2:-build.tgz}"
