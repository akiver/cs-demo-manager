This folder contains NSIS plugins used to build the installer for Windows and is added to the NSIS plugins directory using `addplugindir` by `electron-builder` when packing the app.
See https://www.electron.build/configuration/nsis#custom-nsis-script.

We use the following plugins:

- EnvVar: https://nsis.sourceforge.io/EnVar_plug-in, to add CS:DM to the PATH environment variable during installation.
