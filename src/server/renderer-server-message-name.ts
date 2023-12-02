import type { Settings } from 'csdm/node/settings/settings';
import type { Analysis } from 'csdm/common/types/analysis';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { Download, DownloadDemoProgressPayload, DownloadDemoSuccess } from 'csdm/common/download/download-types';
import type { Demo } from '../common/types/demo';
import type { ErrorCode } from '../common/error-code';
import type { ValveMatch } from '../common/types/valve-match';
import type { SharedServerMessagePayload, SharedServerMessageName } from './shared-server-message-name';
import type {
  GenerateVideoErrorPayload,
  GeneratingVideoFromSequencePayload,
} from './handlers/renderer-process/video/generate-videos-handler';
import type {
  ExportMatchesToXlsxProgressPayload,
  ExportMatchesToXlsxSuccessPayload,
} from './handlers/renderer-process/match/export-matches-to-xlsx-handler';
import type { SheetName } from 'csdm/node/xlsx/sheet-name';
import type {
  ExportDemoPlayersVoiceErrorPayload,
  ExportDemoPlayersVoiceProgressPayload,
} from './handlers/renderer-process/demo/export-demo-players-voice-handler';

// Message names sent from the WebSocket server to the renderer Electron process.
export const RendererServerMessageName = {
  SettingsUpdated: 'settings-updated',
  OptimizeDatabaseSuccess: 'optimize-database-success',
  FetchDemosProgress: 'demos-to-fetch-progress',
  NavigateToDemo: 'navigate-to-demo',
  NavigateToMatch: 'navigate-to-match',
  DemosAddedToAnalyses: 'demos-added-to-analyses',
  DemosRemovedFromAnalyses: 'demos-removed-from-analyses',
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
  DownloadDemoError: 'download-error',
  DownloadDemoSuccess: 'download-demo-success',
  DownloadDemoInCurrentFolderLoaded: 'downloaded-demo-in-current-folder-loaded',
  ExportMatchesToXlsxMatchProgress: 'export-matches-to-xslx-match-progress',
  ExportMatchesToXlsxSheetProgress: 'export-matches-to-xslx-sheet-progress',
  ExportMatchesToXlsxSuccess: 'export-matches-to-xslx-success',
  ExportMatchesToXlsxError: 'export-matches-to-xslx-error',
  ExportDemoPlayersVoiceProgress: 'export-demo-players-voice-progress',
  ExportDemoPlayersVoiceDone: 'export-demo-players-voice-done',
  ExportDemoPlayersVoiceError: 'export-demo-players-voice-error',
  GeneratingVideoFromSequence: 'generating-video-from-sequence',
  ConcatenateSequencesStart: 'concatenate-sequences-start',
  VideosGenerationError: 'videos-generation-error',
  VideosGenerationSuccess: 'concatenate-videos-success',
  StartingGame: 'starting-game',
  ResetTablesStateSuccess: 'reset-tables-state-success',
  IgnoredSteamAccountsChanged: 'ignored-steam-accounts-changed',
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
  [RendererServerMessageName.DownloadDemoError]: string;
  [RendererServerMessageName.DownloadDemoInCurrentFolderLoaded]: Demo;
  [RendererServerMessageName.ExportMatchesToXlsxMatchProgress]: ExportMatchesToXlsxProgressPayload;
  [RendererServerMessageName.ExportMatchesToXlsxSheetProgress]: SheetName;
  [RendererServerMessageName.ExportMatchesToXlsxSuccess]: ExportMatchesToXlsxSuccessPayload;
  [RendererServerMessageName.ExportMatchesToXlsxError]: void;
  [RendererServerMessageName.ExportDemoPlayersVoiceProgress]: ExportDemoPlayersVoiceProgressPayload;
  [RendererServerMessageName.ExportDemoPlayersVoiceDone]: void;
  [RendererServerMessageName.ExportDemoPlayersVoiceError]: ExportDemoPlayersVoiceErrorPayload;
  [RendererServerMessageName.GeneratingVideoFromSequence]: GeneratingVideoFromSequencePayload;
  [RendererServerMessageName.ConcatenateSequencesStart]: void;
  [RendererServerMessageName.VideosGenerationError]: GenerateVideoErrorPayload;
  [RendererServerMessageName.VideosGenerationSuccess]: void;
  [RendererServerMessageName.StartingGame]: void;
  [RendererServerMessageName.ResetTablesStateSuccess]: void;
  [RendererServerMessageName.IgnoredSteamAccountsChanged]: void;
}
