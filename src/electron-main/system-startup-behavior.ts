// The application is automatically launched at startup using the Electron API on Windows and macOS.
// On linux, since Electron doesn't support this feature we use a .desktop file (located in ~/.config/autostart).
//
// Electron doc (Win/macOS): https://www.electronjs.org/docs/api/app#appsetloginitemsettingssettings-macos-windows
// Linux spec: https://specifications.freedesktop.org/autostart-spec/autostart-spec-latest.html
// ! It's disabled during development to not start the dev Electron process when our system starts. You have to package
// the application to test it.
import fs from 'fs-extra';
import os from 'node:os';
import { app } from 'electron';
import { isLinux } from 'csdm/node/os/is-linux';
import { isWindows } from 'csdm/node/os/is-windows';
import { isMac } from 'csdm/node/os/is-mac';
import { StartupBehavior } from 'csdm/common/types/startup-behavior';
import { getRegistryStringKey, writeRegistryStringKey } from 'csdm/node/os/windows-registry';
import { getSettings } from 'csdm/node/settings/get-settings';
import { updateSettings } from 'csdm/node/settings/update-settings';

// @platform linux
function getDesktopFilePath() {
  return `${os.homedir()}/.config/autostart/cs-demo-manager.desktop`;
}

export async function getSystemStartupBehavior(): Promise<StartupBehavior> {
  if (IS_DEV) {
    return StartupBehavior.Off;
  }

  if (isWindows) {
    // openAsHidden is not available on Windows, so in order to detect if the application will start at login AND will
    // start minimized or not, we have to check the registry.
    const data = await getRegistryStringKey({
      path: 'Software\\Microsoft\\Windows\\CurrentVersion\\Run',
      name: 'com.akiver.csdm',
    });
    if (!data) {
      return StartupBehavior.Off;
    }

    if (data.includes('--minimized')) {
      return StartupBehavior.Minimized;
    }

    return StartupBehavior.On;
  }

  if (isMac) {
    // macOS 13+ can't start the app hidden at login (Apple removed the option with the new login items API, which is
    // why Electron dropped openAsHidden) and macOS login items don't support command-line arguments, so the
    // minimized preference is stored in the settings file.
    const { openAtLogin } = app.getLoginItemSettings();
    if (!openAtLogin) {
      return StartupBehavior.Off;
    }

    const settings = await getSettings();
    return settings.startMinimizedAtLogin ? StartupBehavior.Minimized : StartupBehavior.On;
  }

  const desktopFilePath = getDesktopFilePath();
  const fileExists = await fs.pathExists(desktopFilePath);
  if (!fileExists) {
    return StartupBehavior.Off;
  }

  const content = await fs.readFile(desktopFilePath, 'utf8');
  if (content.includes('--minimized')) {
    return StartupBehavior.Minimized;
  }

  return StartupBehavior.On;
}

export async function updateSystemStartupBehavior(behavior: StartupBehavior) {
  if (IS_DEV) {
    return;
  }

  if (isMac) {
    // Login item arguments are not forwarded to the app on macOS, the minimized preference is read from the settings
    // file at launch instead.
    await updateSettings({
      startMinimizedAtLogin: behavior === StartupBehavior.Minimized,
    });
  }

  if (!isLinux) {
    const args = behavior === StartupBehavior.Minimized ? ['--login', '--minimized'] : ['--login'];
    app.setLoginItemSettings({
      openAtLogin: behavior !== StartupBehavior.Off,
      args,
    });

    const exePath = app.getPath('exe');
    // When the username contains spaces on Windows, openAtLogin doesn't work because the path is not surrounded by
    // double quotes. See https://github.com/electron/electron/issues/32657
    if (isWindows && exePath.includes(' ')) {
      await writeRegistryStringKey({
        path: 'Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        name: 'com.akiver.csdm',
        data: `"${exePath}" ${args.join(' ')}`,
      });
    }

    return;
  }

  const desktopFilePath = getDesktopFilePath();
  if (behavior === StartupBehavior.Off) {
    await fs.remove(desktopFilePath);
  } else {
    let execLine = `Exec=${process.execPath} --login`;
    if (behavior === StartupBehavior.Minimized) {
      execLine += ' --minimized';
    }
    const desktopFileContent = `
[Desktop Entry]
Version=1.0
Type=Application
${execLine}
Name=CS Demo Manager
Comment=Counter-Strike Demo Manager
Terminal=false
`;
    await fs.writeFile(desktopFilePath, desktopFileContent);
  }
}
