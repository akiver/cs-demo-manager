#!/usr/bin/env bash

set -e

rm -rf ./dist

# Download the NSIS plugin "EnVar" used to add the app to the PATH on Windows and install it in the build folder.
# The build/x86-unicode and build/x86-ansi are added as addplugindir.
# See https://www.electron.build/configuration/nsis#custom-nsis-script
curl -s -o /tmp/EnVar_plugin.zip https://nsis.sourceforge.io/mediawiki/images/7/7f/EnVar_plugin.zip
unzip -q -o /tmp/EnVar_plugin.zip -d /tmp/EnVar_plugin
cp -r /tmp/EnVar_plugin/Plugins/x86-unicode ./build

npm install
npm run build
npm run electron-builder -- --win --mac --linux
