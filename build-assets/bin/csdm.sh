#!/usr/bin/env sh

if [ ! -L "$0" ]; then
	# if path is not a symlink, find relatively
	APP_PATH="$(dirname "$0")"
else
	if command -v readlink >/dev/null; then
		# if readlink exists, follow the symlink and find relatively
		APP_PATH="$(dirname "$(readlink -f "$0")")"
	else
		# else use the standard install location
		APP_PATH="/usr/share/cs-demo-manager"
	fi
fi

ELECTRON="$APP_PATH/cs-demo-manager"
CLI="$APP_PATH/resources/app.asar/cli.js"
ELECTRON_RUN_AS_NODE=1 "$ELECTRON" "$CLI" "$@"
exit $?