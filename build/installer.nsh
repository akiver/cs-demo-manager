!include WinVer.nsh

!macro customInit
  ${IfNot} ${AtLeastWin10}
    MessageBox mb_iconStop "Windows 10+ is required."
    Abort
  ${EndIf}
!macroend

!macro customInstall
  ; Adds the installation folder to the PATH env variable if it's not already there.
  ; It avoids additional steps on Windows to run the CLI.
  nsExec::Exec 'echo %PATH% | find "$INSTDIR"'
  Pop $0
  ; Not in the PATH variable, add it
  ${If} $0 = 0
    EnVar::SetHKCU
    EnVar::AddValue "PATH" "$INSTDIR"
    Pop $0
    ${If} $0 != 0
      MessageBox MB_OK "Unable to add $INSTDIR to PATH"
    ${EndIf}
  ${EndIf}
!macroend

!macro customUnInstall
  ${ifNot} ${isUpdated}
    ; Delete the installation folder from the PATH env variable
    EnVar::SetHKCU
    EnVar::DeleteValue "PATH" "$INSTDIR"
    Pop $0
    ${If} $0 != 0
        MessageBox MB_OK "Unable to delete $INSTDIR to PATH"
    ${EndIf}

    ; Delete the CSDM folder
    RMDir /r "$PROFILE\.csdm"
    ; Delete the updater folder
    RMDir /r "$PROFILE\AppData\Local\cs-demo-manager-updater"
  ${endIf}
!macroend
