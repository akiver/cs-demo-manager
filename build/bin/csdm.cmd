@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
"%~dp0\cs-demo-manager.exe" "%~dp0\resources\app.asar\cli.js" %*
endlocal
