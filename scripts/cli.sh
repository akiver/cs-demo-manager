#!/usr/bin/env sh

PROJECT_PATH=$(dirname $(dirname $(readlink -f $0)))
ELECTRON="$PROJECT_PATH/node_modules/electron/dist/electron"
CLI="$PROJECT_PATH/out/cli.js"
ELECTRON_RUN_AS_NODE=1 "$ELECTRON" "$CLI" "$@"
exit $?