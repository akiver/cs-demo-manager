#define AppVer "2.13.15"
#define AppName "CSGO Demos Manager"
#define ExeName "CSGODemosManager.exe"
#define AppWebsite "https://www.csgo-demos-manager.com"
; Set it to 1 to clear the cache at startup
#define ClearCache 0

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{2CC5723B-69A1-4B82-AA32-34968284F9C3}
AppName={#AppName}
AppVersion={#AppVer}
AppPublisher=AkiVer
AppPublisherURL={#AppWebsite}
AppSupportURL={#AppWebsite}
AppUpdatesURL={#AppWebsite}
ChangesAssociations = yes
Compression=lzma
DefaultDirName={pf}\CSGO Demos Manager
DefaultGroupName=CSGO Demos Manager
LicenseFile=LICENSE
OutputDir=.
OutputBaseFilename=csgo-demos-manager-{#AppVer}
SolidCompression=yes
UninstallDisplayIcon={app}\{#ExeName}

[Dirs]
Name: "{userappdata}\{#emit SetupSetting("AppPublisher")}\{#emit SetupSetting("AppName")}"

[code]
/////////////////////////////////////////////////////////////////////
function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;


/////////////////////////////////////////////////////////////////////
function IsUpgrade(): Boolean;
begin
  Result := (GetUninstallString() <> '');
end;


/////////////////////////////////////////////////////////////////////
function UnInstallOldVersion(): Integer;
var
  sUnInstallString: String;
  iResultCode: Integer;
begin
// Return Values:
// 1 - uninstall string is empty
// 2 - error executing the UnInstallString
// 3 - successfully executed the UnInstallString

  // default return value
  Result := 0;

  // get the uninstall string of the old app
  sUnInstallString := GetUninstallString();
  if sUnInstallString <> '' then begin
    sUnInstallString := RemoveQuotes(sUnInstallString);
    if Exec(sUnInstallString, '/SILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
      Result := 3
    else
      Result := 2;
  end else
    Result := 1;
end;

/////////////////////////////////////////////////////////////////////
procedure CurStepChanged(CurStep: TSetupStep);
var clearCache : Integer;
begin
  if (CurStep=ssInstall) then
  begin
    if (IsUpgrade()) then
    begin
      UnInstallOldVersion();
    end;
  end;
  if (CurStep=ssPostInstall) then
  clearCache := {#ClearCache};
  begin
    if (clearCache = 1) then
    begin
       SaveStringToFile(ExpandConstant('{userappdata}') + '\\AkiVer\\CSGO Demos Manager\\cache', 'clear', False);
    end;
  end;
end;


// setup registry to change .dem files association
[Registry]
Root: HKCR; Subkey: ".dem"; ValueData: "{#AppName}"; Flags: uninsdeletevalue; ValueType: string; ValueName: ""
Root: HKCR; Subkey: "{#AppName}"; ValueData: "Program {#AppName}"; Flags: uninsdeletekey; ValueType: string; ValueName: ""
Root: HKCR; Subkey: "{#AppName}\DefaultIcon"; ValueData: "{app}\app.ico,0"; ValueType: string; ValueName: ""
Root: HKCR; Subkey: "{#AppName}\shell\open\command"; ValueData: """{app}\{#ExeName}"" ""%1"""; ValueType: string; ValueName: ""

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "fileassoc"; Description: "{cm:AssocFileExtension,{#AppName},.dem}"

[Files]
Source: "Manager\bin\x86\Release\app.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\boiler.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\CommonServiceLocator.dll"; DestDir: "{app}"; Flags: ignoreversion 
Source: "Manager\bin\x86\Release\ControlzEx.dll"; DestDir: "{app}"; Flags: ignoreversion 
Source: "Manager\bin\x86\Release\CSGODemosManager.exe"; DestDir: "{app}"; Flags: ignoreversion 
Source: "Manager\bin\x86\Release\CSGODemosManager.exe.config"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\csgodm.core.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\csgodm.resources.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\csgodm.services.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\CSGOSuspectsBot.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\CSGOSuspectsBot.exe.config"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\DemoInfo.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\GalaSoft.MvvmLight.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\GalaSoft.MvvmLight.Extras.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\GalaSoft.MvvmLight.Platform.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Hardcodet.Wpf.TaskbarNotification.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\ICSharpCode.SharpZipLib.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\MahApps.Metro.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Newtonsoft.Json.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\NPOI.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\NPOI.OOXML.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\NPOI.OpenXml4Net.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\NPOI.OpenXmlFormats.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\protobuf-net.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\steam_api.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\steam_appid.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\System.Windows.Interactivity.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Telerik.Windows.Controls.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Telerik.Windows.Controls.Chart.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Telerik.Windows.Controls.Data.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Telerik.Windows.Controls.DataVisualization.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Telerik.Windows.Controls.Input.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Telerik.Windows.Data.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\WpfPageTransitions.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\WriteableBitmapEx.Wpf.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Manager\bin\x86\Release\Resources\*"; DestDir: "{app}\Resources"; Flags: ignoreversion recursesubdirs createallsubdirs
; Translations
Source: "Manager\bin\x86\Release\ar\*"; DestDir: "{app}\ar"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\da\*"; DestDir: "{app}\da"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\de\*"; DestDir: "{app}\de"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\es\*"; DestDir: "{app}\es"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\fr\*"; DestDir: "{app}\fr"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\hr\*"; DestDir: "{app}\hr"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\hu\*"; DestDir: "{app}\hu"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\it\*"; DestDir: "{app}\it"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\ja\*"; DestDir: "{app}\ja"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\nl\*"; DestDir: "{app}\nl"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\pl\*"; DestDir: "{app}\pl"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\pt\*"; DestDir: "{app}\pt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\pt-BR\*"; DestDir: "{app}\pt-BR"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\ru\*"; DestDir: "{app}\ru"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\sr-Cyrl\*"; DestDir: "{app}\sr-Cyrl"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\tr\*"; DestDir: "{app}\tr"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\zh-Hans\*"; DestDir: "{app}\zh-Hans"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Manager\bin\x86\Release\zh-Hant\*"; DestDir: "{app}\zh-Hant"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#ExeName}"
Name: "{group}\{cm:ProgramOnTheWeb,CSGO Demos Manager}"; Filename: {#AppWebsite}
Name: "{group}\{cm:UninstallProgram,CSGO Demos Manager}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#AppName}"; Filename: "{app}\{#ExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#ExeName}"; Description: "{cm:LaunchProgram,CSGO Demos Manager}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "{cmd}"; Parameters: "/C ""taskkill /im CSGOSuspectsBot.exe /f /t"
