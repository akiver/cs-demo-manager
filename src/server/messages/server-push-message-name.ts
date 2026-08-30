import type { Settings } from 'csdm/node/settings/settings';
import type { Analysis } from 'csdm/common/types/analysis';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { Download, DownloadDemoProgressPayload, DownloadDemoSuccess } from 'csdm/common/download/download-types';
import type { Demo } from 'csdm/common/types/demo';
import type { LoadDemosProgress } from 'csdm/common/types/load-demos-progress';
import type { ErrorCode } from 'csdm/common/error-code';
import type { ValveMatch } from 'csdm/common/types/valve-match';
import type { SharedServerMessagePayload, SharedServerMessageName } from './shared-server-message-name';
import type {
  ExportDemoPlayersVoiceErrorPayload,
  ExportDemoPlayersVoiceProgressPayload,
} from 'csdm/server/handlers/renderer-process/demo/export-demo-players-voice-handler';
import type { Video } from 'csdm/common/types/video';
import type { ExportToXlsxProgressPayload, ExportToXlsxSuccessPayload } from 'csdm/common/types/xlsx';
import type { CounterStrikeErrorPayload } from 'csdm/server/counter-strike';

// Message names pushed from the WebSocket server to the renderer Electron process and the connected CLI processes.
export const ServerPushMessageName = {
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
  StartingCounterStrike: 'starting-counter-strike',
  CounterStrikeError: 'counter-strike-error',
  ResetTablesStateSuccess: 'reset-tables-state-success',
  IgnoredSteamAccountsChanged: 'ignored-steam-accounts-changed',
  TeamNamesUpdated: 'team-names-updated',
} as const;

export type ServerPushMessageName =
  | (typeof ServerPushMessageName)[keyof typeof ServerPushMessageName]
  | SharedServerMessageName;

export interface ServerPushMessagePayload extends SharedServerMessagePayload {
  [ServerPushMessageName.SettingsUpdated]: Settings;
  [ServerPushMessageName.OptimizeDatabaseSuccess]: void;
  [ServerPushMessageName.FetchDemosProgress]: LoadDemosProgress;
  [ServerPushMessageName.NavigateToDemo]: string;
  [ServerPushMessageName.NavigateToMatch]: string;
  [ServerPushMessageName.DemosAddedToAnalyses]: Analysis[];
  [ServerPushMessageName.VideoAddedToQueue]: Video;
  [ServerPushMessageName.VideosRemovedFromQueue]: string[];
  [ServerPushMessageName.VideoUpdated]: Video;
  [ServerPushMessageName.VideoQueueResumed]: void;
  [ServerPushMessageName.VideoQueuePaused]: void;
  [ServerPushMessageName.DemosRemovedFromAnalyses]: string[];
  [ServerPushMessageName.InsertingMatchPositions]: void;
  [ServerPushMessageName.AnalysisUpdated]: Analysis;
  [ServerPushMessageName.MatchInserted]: MatchTable;
  [ServerPushMessageName.FetchLastValveMatchesStart]: void;
  [ServerPushMessageName.FetchLastValveMatchesSuccess]: ValveMatch[];
  [ServerPushMessageName.FetchLastValveMatchesError]: ErrorCode;
  [ServerPushMessageName.FetchLastValveMatchesSteamIdDetected]: string;
  [ServerPushMessageName.DownloadsAdded]: Download[];
  [ServerPushMessageName.DownloadDemoExpired]: string;
  [ServerPushMessageName.DownloadDemoProgress]: DownloadDemoProgressPayload;
  [ServerPushMessageName.DownloadDemoSuccess]: DownloadDemoSuccess;
  [ServerPushMessageName.DownloadDemoCorrupted]: string;
  [ServerPushMessageName.DownloadDemoError]: string;
  [ServerPushMessageName.DownloadDemoInCurrentFolderLoaded]: Demo;
  [ServerPushMessageName.ExportToXlsxProgress]: ExportToXlsxProgressPayload;
  [ServerPushMessageName.ExportToXlsxSheetProgress]: string;
  [ServerPushMessageName.ExportToXlsxSuccess]: ExportToXlsxSuccessPayload;
  [ServerPushMessageName.ExportToXlsxError]: void;
  [ServerPushMessageName.ExportDemoPlayersVoiceProgress]: ExportDemoPlayersVoiceProgressPayload;
  [ServerPushMessageName.ExportDemoPlayersVoiceDone]: void;
  [ServerPushMessageName.ExportDemoPlayersVoiceError]: ExportDemoPlayersVoiceErrorPayload;
  [ServerPushMessageName.StartingCounterStrike]: void;
  [ServerPushMessageName.CounterStrikeError]: CounterStrikeErrorPayload;
  [ServerPushMessageName.ResetTablesStateSuccess]: void;
  [ServerPushMessageName.IgnoredSteamAccountsChanged]: void;
  [ServerPushMessageName.TeamNamesUpdated]: number;
}

export type ServerPushListener<MessageName extends ServerPushMessageName = ServerPushMessageName> = (
  payload: ServerPushMessagePayload[MessageName],
) => void;
