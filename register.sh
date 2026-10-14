#!/usr/bin/env bash
set -eu
cd -- "$(dirname -- "$0")"
node scripts/launch.mjs register
