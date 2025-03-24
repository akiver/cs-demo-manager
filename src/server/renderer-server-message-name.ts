import type { Settings } from 'csdm/node/settings/settings';
import type { Analysis } from 'csdm/common/types/analysis';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { Download, DownloadDemoProgressPayload, DownloadDemoSuccess } from 'csdm/common/download/download-types';
import type { Demo } from '../common/types/demo';
import type { ErrorCode } from '../common/error-code';
import type { ValveMatch } from '../common/types/valve-match';
import type { SharedServerMessagePayload, SharedServerMessageName } from './shared-server-message-name';
import type {
  ExportDemoPlayersVoiceErrorPayload,
  ExportDemoPlayersVoiceProgressPayload,
} from './handlers/renderer-process/demo/export-demo-players-voice-handler';
import type { Video } from 'csdm/common/types/video';
import type { ExportToXlsxProgressPayload, ExportToXlsxSuccessPayload } from 'csdm/common/types/xlsx';

// Message names sent from the WebSocket server to the renderer Electron process.
export const RendererServerMessageName = {
  SettingsUpdated: 'settings-updated',
  OptimizeDatabaseSuccess: 'optimize-database-success',
  FetchDemosProgress: 'demos-to-fetch-progress',
  NavigateToDemo: 'navigate-to-demo',
  NavigateToMatch: 'navigate-to-match',
  DemosAddedToAnalyses: 'demos-added-to-analyses',
  DemosRemovedFromAnalyses: 'demos-removed-from-analyses',
  VideoAddedToQueue: 'video-added-to-queue',
  VideosRemovedFromQueue: 'videos-removed-from-queue',
  VideoUpdated: 'video-updated',
  VideoQueuePaused: 'video-queue-paused',
  VideoQueueResumed: 'video-queue-resumed',
  AnalysisUpdated: 'analysis-status-changed',
  InsertingMatchPositions: 'inserting-match-positions',
  MatchInserted: 'match-inserted',
  FetchLastValveMatchesStart: 'fetch-last-valve-matches-start',
  FetchLastValveMatchesSuccess: 'fetch-last-valve-matches-success',
  FetchLastValveMatchesError: 'fetch-last-valve-matches-error',
  FetchLastValveMatchesSteamIdDetected: 'fetch-last-valve-matches-steam-id-detected',
  DownloadsAdded: 'downloads-added',
  DownloadDemoExpired: 'download-demo-expired',
  DownloadDemoProgress: 'download-demo-progress',
  DownloadDemoCorrupted: 'download-demo-corrupted',
  DownloadDemoError: 'download-error',
  DownloadDemoSuccess: 'download-demo-success',
  DownloadDemoInCurrentFolderLoaded: 'downloaded-demo-in-current-folder-loaded',
  ExportToXlsxProgress: 'export-to-xslx-progress',
  ExportToXlsxSheetProgress: 'export-to-xslx-sheet-progress',
  ExportToXlsxSuccess: 'export-to-xslx-success',
  ExportToXlsxError: 'export-to-xslx-error',
  ExportDemoPlayersVoiceProgress: 'export-demo-players-voice-progress',
  ExportDemoPlayersVoiceDone: 'export-demo-players-voice-done',
  ExportDemoPlayersVoiceError: 'export-demo-players-voice-error',
  StartingGame: 'starting-game',
  ResetTablesStateSuccess: 'reset-tables-state-success',
  IgnoredSteamAccountsChanged: 'ignored-steam-accounts-changed',
  TeamNamesUpdated: 'team-names-updated',
} as const;

export type RendererServerMessageName =
  | (typeof RendererServerMessageName)[keyof typeof RendererServerMessageName]
  | SharedServerMessageName;

export interface RendererServerMessagePayload extends SharedServerMessagePayload {
  [RendererServerMessageName.SettingsUpdated]: Settings;
  [RendererServerMessageName.OptimizeDatabaseSuccess]: void;
  [RendererServerMessageName.FetchDemosProgress]: {
    demoLoadedCount: number;
    demoToLoadCount: number;
  };
  [RendererServerMessageName.NavigateToDemo]: string;
  [RendererServerMessageName.NavigateToMatch]: string;
  [RendererServerMessageName.DemosAddedToAnalyses]: Analysis[];
  [RendererServerMessageName.VideoAddedToQueue]: Video;
  [RendererServerMessageName.VideosRemovedFromQueue]: string[];
  [RendererServerMessageName.VideoUpdated]: Video;
  [RendererServerMessageName.VideoQueueResumed]: void;
  [RendererServerMessageName.VideoQueuePaused]: void;
  [RendererServerMessageName.DemosRemovedFromAnalyses]: string[];
  [RendererServerMessageName.InsertingMatchPositions]: void;
  [RendererServerMessageName.AnalysisUpdated]: Analysis;
  [RendererServerMessageName.MatchInserted]: MatchTable;
  [RendererServerMessageName.FetchLastValveMatchesStart]: void;
  [RendererServerMessageName.FetchLastValveMatchesSuccess]: ValveMatch[];
  [RendererServerMessageName.FetchLastValveMatchesError]: ErrorCode;
  [RendererServerMessageName.FetchLastValveMatchesSteamIdDetected]: string;
  [RendererServerMessageName.DownloadsAdded]: Download[];
  [RendererServerMessageName.DownloadDemoExpired]: string;
  [RendererServerMessageName.DownloadDemoProgress]: DownloadDemoProgressPayload;
  [RendererServerMessageName.DownloadDemoSuccess]: DownloadDemoSuccess;
  [RendererServerMessageName.DownloadDemoCorrupted]: string;
  [RendererServerMessageName.DownloadDemoError]: string;
  [RendererServerMessageName.DownloadDemoInCurrentFolderLoaded]: Demo;
  [RendererServerMessageName.ExportToXlsxProgress]: ExportToXlsxProgressPayload;
  [RendererServerMessageName.ExportToXlsxSheetProgress]: string;
  [RendererServerMessageName.ExportToXlsxSuccess]: ExportToXlsxSuccessPayload;
  [RendererServerMessageName.ExportToXlsxError]: void;
  [RendererServerMessageName.ExportDemoPlayersVoiceProgress]: ExportDemoPlayersVoiceProgressPayload;
  [RendererServerMessageName.ExportDemoPlayersVoiceDone]: void;
  [RendererServerMessageName.ExportDemoPlayersVoiceError]: ExportDemoPlayersVoiceErrorPayload;
  [RendererServerMessageName.StartingGame]: void;
  [RendererServerMessageName.ResetTablesStateSuccess]: void;
  [RendererServerMessageName.IgnoredSteamAccountsChanged]: void;
  [RendererServerMessageName.TeamNamesUpdated]: number;
}
