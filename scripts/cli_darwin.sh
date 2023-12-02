#!/usr/bin/env bash

SCRIPT_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
PROJECT_PATH="$(dirname "$SCRIPT_PATH")"
ELECTRON=""$PROJECT_PATH"/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron"
CLI=""$PROJECT_PATH"/out/cli.js"

ELECTRON_RUN_AS_NODE=1 "$ELECTRON" "$CLI" "$@"
exit $?
