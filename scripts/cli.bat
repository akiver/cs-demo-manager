@echo off
setlocal

for %%A in ("%~dp0.") do set PROJECT_PATH=%%~dpA
set PROJECT_PATH=%PROJECT_PATH:~0,-1%

set ELECTRON="%PROJECT_PATH%\node_modules\electron\dist\electron.exe"

set ELECTRON_RUN_AS_NODE=1

%ELECTRON% out\cli.js %*

endlocal