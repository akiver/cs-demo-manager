process.env.PROCESS_NAME = 'renderer';
import 'csdm/node/logger';
import path from 'node:path';
import type {
  IpcRendererEvent,
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
} from 'electron';
import { ipcRenderer, contextBridge, webUtils } from 'electron';
import fs from 'fs-extra';
import { getRankImageSrc } from 'csdm/node/filesystem/get-rank-image-src';
import { getPremierRankImageSrc } from 'csdm/node/filesystem/get-premier-rank-image-src';
import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';
import { IPCChannel } from 'csdm/common/ipc-channel';
import { getSettings } from 'csdm/node/settings/get-settings';
import { updateSettings } from 'csdm/node/settings/update-settings';
import { isLinux } from 'csdm/node/os/is-linux';
import { getUnknownMapThumbnailFilePath } from 'csdm/node/filesystem/maps/get-unknown-map-thumbnail-file-path';
import { getMapRadarBase64 } from 'csdm/node/filesystem/maps/get-map-radar-base64';
import { getMapLowerRadarBase64 } from 'csdm/node/filesystem/maps/get-map-lower-radar-base64';
import { getMapThumbnailBase64 } from 'csdm/node/filesystem/maps/get-map-thumbnail-base64';
import { getPngInformation } from 'csdm/node/filesystem/get-png-information';
import { getFfmpegExecutablePath } from 'csdm/node/video/ffmpeg/ffmpeg-location';
import { writeTableState } from 'csdm/node/settings/table/write-table-state';
import { readTableState } from 'csdm/node/settings/table/read-table-state';
import { getHlaeExecutablePath } from 'csdm/node/video/hlae/hlae-location';
import { getVirtualDubExecutablePath } from 'csdm/node/video/virtual-dub/get-virtual-dub-executable-path';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { getImagesFolderPath } from 'csdm/node/filesystem/get-images-folder-path';
import { onWindowError } from 'csdm/common/on-window-error';
import { elementToImage } from 'csdm/preload/element-to-image';
import type { StartupBehavior } from 'csdm/common/types/startup-behavior';
import { getAppInformation } from 'csdm/node/get-app-information';
import { resetSettings } from 'csdm/node/settings/reset-settings';
import { getDemoAudioData } from 'csdm/preload/get-demo-audio-data';
import { getDemoAudioFilePath } from 'csdm/node/demo/get-demo-audio-file-path';

window.addEventListener('error', onWindowError);
window.addEventListener('unhandledrejection', (error) => {
  logger.error(error.reason);
});

const api: PreloadApi = {
  logger,
  ADDITIONAL_ARGUMENTS: process.argv,
  IMAGES_FOLDER_PATH: path.join(getStaticFolderPath(), 'images'),
  getAppInformation,
  getStartupArguments: () => {
    return ipcRenderer.invoke(IPCChannel.GetStartupArguments);
  },
  clearStartupArguments: () => {
    ipcRenderer.invoke(IPCChannel.ClearStartupArguments);
  },
  getTheme: async () => {
    const settings = await getSettings();
    return settings.ui.theme;
  },
  getSystemStartupBehavior: () => {
    return ipcRenderer.invoke(IPCChannel.GetSystemStartupBehavior);
  },
  updateSystemStartupBehavior: async (behavior: StartupBehavior) => {
    await ipcRenderer.invoke(IPCChannel.UpdateSystemStartupBehavior, behavior);
  },
  getHlaeExecutablePath,
  getFfmpegExecutablePath,
  getVirtualDubExecutablePath: async () => {
    return Promise.resolve(getVirtualDubExecutablePath());
  },
  platform: process.platform,
  isMac,
  isWindows,
  isLinux,
  unknownMapThumbnailFilePath: getUnknownMapThumbnailFilePath(),
  getMapRadarBase64,
  getMapLowerRadarBase64,
  getMapThumbnailBase64,
  getPngInformation,
  parseSettingsFile: getSettings,
  updateSettings,
  resetSettings,
  writeTableState,
  readTableState,
  getDefaultPlayerAvatar: () => {
    const imagesFolderPath = getImagesFolderPath();
    return `file://${path.join(imagesFolderPath, 'avatar.jpg')}`;
  },
  getRankImageSrc,
  getPremierRankImageSrc,
  pathExists: fs.pathExists,
  getPathDirectoryName: path.dirname,
  getPathBasename: path.basename,
  elementToImage,

  showMainWindow: () => {
    ipcRenderer.invoke(IPCChannel.ShowWindow);
  },

  localeChanged: (locale: string) => {
    ipcRenderer.invoke(IPCChannel.LocaleChanged, locale);
  },

  isWindowMaximized: async () => {
    const isWindowMaximized = await ipcRenderer.invoke(IPCChannel.IsWindowMaximized);
    return isWindowMaximized;
  },

  maximizeWindow: () => {
    ipcRenderer.invoke(IPCChannel.MaximizeWindow);
  },

  unMaximizeWindow: () => {
    ipcRenderer.invoke(IPCChannel.UnMazimizeWindow);
  },

  closeWindow: () => {
    ipcRenderer.invoke(IPCChannel.CloseWindow);
  },

  minimizeWindow: () => {
    ipcRenderer.invoke(IPCChannel.MinimizeWindow);
  },

  onWindowClose: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.WindowClose, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.WindowClose, callback);
    };
  },

  onWindowMaximized: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.WindowMaximized, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.WindowMaximized, callback);
    };
  },

  onWindowUnMaximized: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.WindowUnMaximized, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.WindowUnMaximized, callback);
    };
  },

  onOpenDemoFile: (callback: (event: IpcRendererEvent, demoPath: string) => void) => {
    ipcRenderer.on(IPCChannel.OpenDemFile, (event, demoPath: string) => {
      callback(event, demoPath);
    });

    return () => {
      ipcRenderer.removeListener(IPCChannel.OpenDemFile, callback);
    };
  },

  showTitleBarMenu: () => {
    ipcRenderer.invoke(IPCChannel.ShowTitleBarMenu);
  },

  canGoBack: async () => {
    const canGoBack = await ipcRenderer.invoke(IPCChannel.CanGoBack);
    return canGoBack;
  },

  canGoForward: async () => {
    const canGoForward = await ipcRenderer.invoke(IPCChannel.CanGoForward);
    return canGoForward;
  },

  onOpenSettings: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.OpenSettings, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.OpenSettings, callback);
    };
  },

  onToggleSettingsVisibility: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.ToggleSettingsVisibility, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.ToggleSettingsVisibility, callback);
    };
  },

  onShowAbout: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.ShowAbout, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.ShowAbout, callback);
    };
  },

  reloadWindow: () => {
    ipcRenderer.invoke(IPCChannel.ReloadWindow);
  },

  restartApp: () => {
    ipcRenderer.invoke(IPCChannel.RestartApp);
  },

  showSaveDialog: async (options: SaveDialogOptions) => {
    const result: SaveDialogReturnValue = await ipcRenderer.invoke(IPCChannel.ShowSaveDialog, options);
    return result;
  },

  showOpenDialog: async (options: OpenDialogOptions) => {
    const result: OpenDialogReturnValue = await ipcRenderer.invoke(IPCChannel.ShowOpenDialog, options);
    return result;
  },

  browseToFolder: (folderPath: string) => {
    ipcRenderer.invoke(IPCChannel.BrowseToFolder, folderPath);
  },

  browseToFile: (filePath: string) => {
    ipcRenderer.invoke(IPCChannel.BrowseToFile, filePath);
  },

  onNavigateToPendingDownloads: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.NavigateToPendingDownloads, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.NavigateToPendingDownloads, callback);
    };
  },

  onNavigateToBans: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.NavigateToBans, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.NavigateToBans, callback);
    };
  },

  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.addListener(IPCChannel.UpdateDownloaded, callback);

    return () => {
      ipcRenderer.removeListener(IPCChannel.UpdateDownloaded, callback);
    };
  },

  hasUpdateReadyToInstall: () => {
    return ipcRenderer.invoke(IPCChannel.HasUpdateReadyToInstall);
  },

  installUpdate: () => {
    ipcRenderer.invoke(IPCChannel.InstallUpdate);
  },

  toggleAutoDownloadUpdates: (isEnabled: boolean) => {
    ipcRenderer.invoke(IPCChannel.ToggleAutoUpdate, isEnabled);
  },

  shouldShowChangelog: async () => {
    const changelogFilePath = path.join(getStaticFolderPath(), 'changelog');
    const fileExists = await fs.pathExists(changelogFilePath);
    // Delete the file to prevent the changelog dialog from showing next time the app is opened.
    await fs.remove(changelogFilePath);

    return fileExists;
  },

  getWebFilePath: (file: File) => {
    return webUtils.getPathForFile(file);
  },

  getDemoAudioFilePath,
  getDemoAudioData,
};

contextBridge.exposeInMainWorld('csdm', api);
