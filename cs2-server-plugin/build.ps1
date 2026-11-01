# Builds the Windows plugin into static/cs2/server.dll, the counterpart of `make build` on Linux.
# Works from any shell and any folder: powershell -ExecutionPolicy Bypass -File build.ps1 [-Configuration Debug]
param(
    # Debug adds the reverse-engineering commands and keeps server.pdb next to the DLL.
    [ValidateSet('Release', 'Debug')]
    [string]$Configuration = 'Release'
)

$ErrorActionPreference = 'Stop'

$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (-not (Test-Path $vswhere)) {
    Write-Error "vswhere not found at $vswhere, install Visual Studio with the 'Desktop development with C++' workload."
}

$msbuild = & $vswhere -latest -requires Microsoft.Component.MSBuild -find 'MSBuild\**\Bin\amd64\MSBuild.exe' |
    Select-Object -First 1
if (-not $msbuild) {
    Write-Error "MSBuild not found, install Visual Studio with the 'Desktop development with C++' workload."
}

& $msbuild "$PSScriptRoot\cs2-server-plugin.sln" "-p:Configuration=$Configuration" -p:Platform=x64 -m -v:minimal
exit $LASTEXITCODE
