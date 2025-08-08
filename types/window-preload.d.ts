import type {
  OpenDialogOptions,
  SaveDialogOptions,
  SaveDialogReturnValue,
  OpenDialogReturnValue,
  IpcRendererEvent,
} from 'electron';
import type fs from 'fs-extra';
import type { ILogger } from 'csdm/node/logger';
import type { Settings } from 'csdm/node/settings/settings';
import type { UpdateSettingsOptions } from 'csdm/node/settings/update-settings';
import type { getMapRadarBase64 } from 'csdm/node/filesystem/maps/get-map-radar-base64';
import type { getMapLowerRadarBase64 } from 'csdm/node/filesystem/maps/get-map-lower-radar-base64';
import type { getMapThumbnailBase64 } from 'csdm/node/filesystem/maps/get-map-thumbnail-base64';
import type { getPngInformation } from 'csdm/node/filesystem/get-png-information';
import type { PremierRank, Rank } from 'csdm/common/types/counter-strike';
import type { writeTableState } from 'csdm/node/settings/table/write-table-state';
import type { readTableState } from 'csdm/node/settings/table/read-table-state';
import type { Argument } from 'csdm/common/types/argument';
import type { ElementToImageOptions } from 'csdm/preload/element-to-image';
import type { ThemeName } from 'csdm/common/types/theme-name';
import type { StartupBehavior } from 'csdm/common/types/startup-behavior';
import type { AppInformation } from 'csdm/node/get-app-information';
import type { getDemoAudioData } from 'csdm/preload/get-demo-audio-data';
import type { getDemoAudioFilePath } from 'csdm/node/demo/get-demo-audio-file-path';

declare global {
  interface PreloadApi {
    logger: ILogger;
    platform: NodeJS.Platform;
    isWindows: boolean;
    getAppInformation: () => AppInformation;
    isMac: boolean;
    isLinux: boolean;
    unknownMapThumbnailFilePath: string;
    IMAGES_FOLDER_PATH: string;
    ADDITIONAL_ARGUMENTS: string[];
    getStartupArguments: () => Promise<Argument[]>;
    getTheme: () => Promise<ThemeName>;
    getWebFilePath: (file: File) => string;
    getSystemStartupBehavior: () => Promise<StartupBehavior>;
    updateSystemStartupBehavior: (behavior: StartupBehavior) => Promise<void>;
    clearStartupArguments: () => void;
    getHlaeExecutablePath: () => Promise<string>;
    getFfmpegExecutablePath: () => Promise<string>;
    getVirtualDubExecutablePath: () => Promise<string>;
    parseSettingsFile: () => Promise<Settings>;
    updateSettings: (settings: DeepPartial<Settings>, options?: UpdateSettingsOptions) => Promise<Settings>;
    resetSettings: () => Promise<void>;
    readTableState: typeof readTableState;
    writeTableState: typeof writeTableState;
    getMapRadarBase64: typeof getMapRadarBase64;
    getMapLowerRadarBase64: typeof getMapLowerRadarBase64;
    getMapThumbnailBase64: typeof getMapThumbnailBase64;
    getPngInformation: typeof getPngInformation;
    getDefaultPlayerAvatar: () => string;
    getRankImageSrc: (rankNumber: Rank) => string;
    getPremierRankImageSrc: (rank: PremierRank) => string;
    pathExists: typeof fs.pathExists;
    getPathDirectoryName: (path: string) => string;
    getPathBasename: (path: string) => string;
    showMainWindow: () => void;
    onOpenDemoFile: (callback: (event: IpcRendererEvent, demoPath: string) => void) => () => void;
    onOpenSettings: (callback: () => void) => () => void;
    onToggleSettingsVisibility: (callback: () => void) => () => void;
    onShowAbout: (callback: () => void) => () => void;
    restartApp: () => void;
    reloadWindow: () => void;
    showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogReturnValue>;
    showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
    elementToImage: (options: ElementToImageOptions) => Promise<string | undefined>;
    browseToFolder: (folderPath: string) => void;
    browseToFile: (filePath: string) => void;
    localeChanged: (locale: string) => void;
    canGoBack: () => Promise<boolean>;
    canGoForward: () => Promise<boolean>;
    showTitleBarMenu: () => void;
    isWindowMaximized: () => Promise<boolean>;
    onWindowClose: (callback: () => void) => () => void;
    onWindowMaximized: (callback: () => void) => () => void;
    onWindowUnMaximized: (callback: () => void) => () => void;
    maximizeWindow: () => void;
    unMaximizeWindow: () => void;
    closeWindow: () => void;
    minimizeWindow: () => void;
    onNavigateToPendingDownloads: (callback: () => void) => () => void;
    onNavigateToBans: (callback: () => void) => () => void;
    onUpdateDownloaded: (callback: () => void) => () => void;
    hasUpdateReadyToInstall: () => Promise<boolean>;
    installUpdate: () => void;
    toggleAutoDownloadUpdates: (isEnabled: boolean) => void;
    shouldShowChangelog: () => Promise<boolean>;
    getDemoAudioFilePath: typeof getDemoAudioFilePath;
    getDemoAudioData: typeof getDemoAudioData;
  }

  interface Window {
    csdm: PreloadApi;
  }
}

export {};
