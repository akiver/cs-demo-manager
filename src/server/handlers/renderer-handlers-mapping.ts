import type { Download } from 'csdm/common/download/download-types';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import { addDownloadHandler } from './renderer-process/download/add-download-handler';
import { addFaceitAccountHandler } from './renderer-process/faceit/add-faceit-account-handler';
import {
  initializeApplicationHandler,
  type InitializeApplicationSuccessPayload,
} from './renderer-process/initialize-application-handler';
import type { FetchMatchesTablePayload } from './renderer-process/match/fetch-matches-table-handler';
import { fetchMatchesTableHandler } from './renderer-process/match/fetch-matches-table-handler';
import { fetchMatchByChecksumHandler } from './renderer-process/match/fetch-match-by-checksum-handler';
import { fetchMatchHeatmapPointsHandler } from './renderer-process/match/fetch-match-heatmap-points-handler';
import type {
  Fetch2dViewerDataPayload,
  Fetch2dViewerDataSuccessPayload,
} from './renderer-process/match/fetch-2d-viewer-data-handler';
import { fetch2DViewerDataHandler } from './renderer-process/match/fetch-2d-viewer-data-handler';
import type { UpdateCommentPayload } from './renderer-process/match/update-comment-handler';
import { updateCommentHandler } from './renderer-process/match/update-comment-handler';
import type {
  InitializeVideoPayload,
  InitializeVideoSuccessPayload,
} from './renderer-process/video/initialize-video-handler';
import { initializeVideoHandler } from './renderer-process/video/initialize-video-handler';
import { fetchDemosTableHandler } from './renderer-process/demo/fetch-demos-table-handler';
import { loadDemoHandler } from './renderer-process/demo/load-demo-handler';
import { navigateToDemoOrMatch } from './renderer-process/navigate-to-demo-or-match-handler';
import { addDemosToAnalysesHandler } from './renderer-process/demo/add-demos-to-analyses-handler';
import { removeDemosFromAnalysesHandler } from './renderer-process/demo/remove-demos-from-analyses-handler';
import { deleteMatchesHandler } from './renderer-process/match/delete-matches-handler';
import { deleteIgnoredSteamAccountHandler } from './renderer-process/steam-accounts/delete-ignored-steam-account-handler';
import { fetchLastValveMatchesHandler } from './renderer-process/download/fetch-last-valve-matches-handler';
import { abortDownloadHandler } from './renderer-process/download/abort-download-handler';
import { addDownloadsHandler } from './renderer-process/download/add-downloads-handler';
import { addDownloadFromShareCodeHandler } from './renderer-process/download/add-download-from-share-code-handler';
import { deleteDemosHandler, type DeleteDemosResultPayload } from './renderer-process/demo/delete-demos-handler';
import type { ExportMatchesToXlsxPayload } from './renderer-process/match/export-matches-to-xlsx-handler';
import { exportMatchesToXlsxHandler } from './renderer-process/match/export-matches-to-xlsx-handler';
import { addIgnoredSteamAccountHandler } from './renderer-process/steam-accounts/add-ignored-steam-account-handler';
import { addMapHandler } from './renderer-process/map/add-map-handler';
import { updateMapHandler } from './renderer-process/map/update-map-handler';
import type { MapPayload } from './renderer-process/map/map-payload';
import { deleteMapHandler } from './renderer-process/map/delete-map-handler';
import { fetchBanStatsHandler } from './renderer-process/bans/fetch-ban-stats-handler';
import { disconnectDatabaseConnectionHandler } from './renderer-process/database/disconnect-database-connection-handler';
import {
  connectDatabaseHandler,
  type ConnectDatabaseError,
} from './renderer-process/database/connect-database-handler';
import { addVideoToQueueHandler } from './renderer-process/video/add-video-to-queue-handler';
import type { UpdateMatchDemoLocationPayload } from './renderer-process/match/update-match-demo-location-handler';
import { updateMatchDemoLocationHandler } from './renderer-process/match/update-match-demo-location-handler';
import { installHlaeHandler } from './renderer-process/video/install-hlae-handler';
import { updateHlaeHandler } from './renderer-process/video/update-hlae-handler';
import { installVirtualDubHandler } from './renderer-process/video/install-virtual-dub-handler';
import { installFfmpegHandler } from './renderer-process/video/install-ffmpeg-handler';
import { updateFfmpegHandler } from './renderer-process/video/update-ffmpeg-handler';
import { removeVideosFromQueueHandler } from './renderer-process/video/remove-videos-from-queue-handler';
import { fetchMatchGrenadesThrowHandler } from './renderer-process/match/fetch-match-grenades-throw-handler';
import { getDatabaseSizeHandler } from './renderer-process/database/get-database-size-handler';
import type { OptimizeDatabasePayload } from './renderer-process/database/optimize-database-handler';
import { optimizeDatabaseHandler } from './renderer-process/database/optimize-database-handler';
import { fetchPlayersHandler } from './renderer-process/player/fetch-players-table-handler';
import type { WatchDemoPayload } from './renderer-process/counter-strike/watch-demo-handler';
import { watchDemoHandler } from './renderer-process/counter-strike/watch-demo-handler';
import {
  watchPlayerHighlightsHandler,
  type WatchPlayerHighlightsPayload,
} from './renderer-process/counter-strike/watch-player-highlights-handler';
import {
  watchPlayerLowlightsHandler,
  type WatchPlayerLowlightsPayload,
} from './renderer-process/counter-strike/watch-player-lowlights-handler';
import type { ExportChatMessagesPayload } from './renderer-process/match/export-match-chat-messages-handler';
import { exportMatchChatMessagesHandler } from './renderer-process/match/export-match-chat-messages-handler';
import type { WriteBase64FilePayload } from './renderer-process/filesystem/write-base64-file-handler';
import { writeBase64FileHandler } from './renderer-process/filesystem/write-base64-file-handler';
import type { UpdateDemosSourcePayload } from './renderer-process/demo/update-demos-source-handler';
import { updateDemosSourceHandler } from './renderer-process/demo/update-demos-source-handler';
import { fetchPlayerHandler, type FetchPlayerPayload } from './renderer-process/player/fetch-player-handler';
import { resetDatabaseHandler } from './renderer-process/database/reset-database-handler';
import { updateTagHandler } from './renderer-process/tags/update-tag-handler';
import { deleteTagHandler } from './renderer-process/tags/delete-tag-handler';
import { insertTagHandler } from './renderer-process/tags/insert-tag-handler';
import type { UpdateChecksumsTagsPayload } from './renderer-process/tags/update-checksums-tags-handler';
import { updateChecksumsTagsHandler } from './renderer-process/tags/update-checksums-tags-handler';
import { isCounterStrikeRunningHandler } from './renderer-process/counter-strike/is-counter-strike-running-handler';
import type { MatchHeatmapFilter, TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Demo } from 'csdm/common/types/demo';
import type { Map } from 'csdm/common/types/map';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Tag } from 'csdm/common/types/tag';
import type { Handler } from 'csdm/server/handler';
import { resetMapsHandler } from './renderer-process/map/reset-maps-handler';
import { resetTablesStateHandler } from './renderer-process/settings/reset-tables-state-handler';
import { enableFfmpegCustomLocationHandler } from './renderer-process/settings/enable-ffmpeg-custom-location-handler';
import { disableFfmpegCustomLocationHandler } from './renderer-process/settings/disable-ffmpeg-custom-location-handler';
import { enableHlaeCustomLocationHandler } from './renderer-process/settings/enable-hlae-custom-location-handler';
import { disableHlaeCustomLocationHandler } from './renderer-process/settings/disable-hlae-custom-location-handler';
import { fetchLastFaceitMatchesHandler } from './renderer-process/faceit/fetch-last-faceit-matches-handler';
import { updateCurrentFaceitAccountHandler } from './renderer-process/faceit/update-current-faceit-account-handler';
import { deleteFaceitAccountHandler } from './renderer-process/faceit/delete-faceit-account-handler';
import { abortDownloadsHandler } from './renderer-process/download/abort-downloads-handler';
import type { RenameDemoPayload } from './renderer-process/demo/rename-demo-handler';
import { renameDemoHandler } from './renderer-process/demo/rename-demo-handler';
import type { ColumnID } from 'csdm/common/types/column-id';
import type { ExportDemoPlayersVoicePayload } from './renderer-process/demo/export-demo-players-voice-handler';
import { exportDemoPlayersVoiceHandler } from './renderer-process/demo/export-demo-players-voice-handler';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { Point } from 'csdm/common/types/point';
import type { IgnoredSteamAccount } from 'csdm/common/types/ignored-steam-account';
import type { BanStats } from 'csdm/common/types/ban-stats';
import type { PlayerProfile } from 'csdm/common/types/player-profile';
import type { PlayerTable } from 'csdm/common/types/player-table';
import type { UpdateDemosTypePayload } from './renderer-process/demo/update-demos-type-handler';
import { updateDemosTypeHandler } from './renderer-process/demo/update-demos-type-handler';
import type { UpdateMatchesTypePayload } from './renderer-process/match/update-matches-type-handler';
import { updateMatchesTypeHandler } from './renderer-process/match/update-matches-type-handler';
import type { PlayersTableFilter } from 'csdm/node/database/players/players-table-filter';
import type { DemosTableFilter } from 'csdm/node/database/demos/demos-table-filter';
import { searchHandler, type SearchPayload } from './renderer-process/search/search-handler';
import { searchPlayersHandler } from './renderer-process/search/search-players-handler';
import { searchMapNamesHandler } from './renderer-process/search/search-map-names-handler';
import type { SearchResult } from 'csdm/common/types/search/search-result';
import type { MapNamesFilter } from 'csdm/common/types/search/map-names-filter';
import type { PlayerResult } from 'csdm/common/types/search/player-result';
import type { PlayersFilter } from 'csdm/common/types/search/players-filter';
import type { Match } from 'csdm/common/types/match';
import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';
import type { FfmpegVersionChangedPayload } from './renderer-process/settings/ffmpeg-version-changed-payload';
import type { HlaeVersionChangedPayload } from './renderer-process/settings/hlae-version-changed-payload';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import {
  exportMatchesToJsonHandler,
  type ExportMatchesToJsonPayload,
} from './renderer-process/match/export-matches-to-json-handler';
import {
  watchPlayerAsSuspectHandler,
  type WatchPlayerAsSuspectPayload,
} from './renderer-process/counter-strike/watch-player-as-suspect-handler';
import {
  generateMatchPositionsHandler,
  type GenerateMatchPositionsPayload,
} from './renderer-process/match/generate-match-positions-handler';
import type { Game } from 'csdm/common/types/counter-strike';
import {
  updatePlayerCommentHandler,
  type UpdatePlayerCommentPayload,
} from './renderer-process/player/update-player-comment-handler';
import { isCs2ConnectedToServerHandler } from './renderer-process/counter-strike/is-cs2-connected-to-server-handler';
import { fetchMigrationsHandler } from './renderer-process/migrations/fetch-migrations-handler';
import type { Migration } from 'csdm/node/database/migrations/fetch-migrations';
import { deleteDemosFromDatabaseHandler } from './renderer-process/demo/delete-demos-from-database-handler';
import type { WatchDemoErrorPayload } from './renderer-process/counter-strike/counter-strike';
import {
  watchPlayerRoundsHandler,
  type WatchPlayerRoundsPayload,
} from './renderer-process/counter-strike/watch-player-rounds-handler';
import { updateRoundTagsHandler, type UpdateRoundTagsPayload } from './renderer-process/tags/update-round-tags-handler';
import { fetchMatchFlashbangMatrixRowsHandler } from './renderer-process/match/fetch-match-flashbang-matrix-rows-handler';
import type { FlashbangMatrixRow } from 'csdm/common/types/flashbang-matrix-row';
import { importDataFromV2BackupHandler } from './renderer-process/database/import-data-from-v2-backup-handler';
import type {
  ImportV2BackupOptions,
  ImportV2BackupResult,
} from 'csdm/node/database/database/import-data-from-v2-backup';
import { fetchMatchDuelsMatrixRowsHandler } from './renderer-process/match/fetch-match-duels-matrix-rows-handler';
import type { DuelMatrixRow } from 'csdm/common/types/duel-matrix-row';
import type { TeamsTableFilter } from 'csdm/node/database/teams/teams-table-filter';
import type { TeamTable } from 'csdm/common/types/team-table';
import { fetchTeamsTableHandler } from './renderer-process/team/fetch-teams-table-handler';
import { fetchTeamHandler } from './renderer-process/team/fetch-team-handler';
import type { TeamFilters } from 'csdm/node/database/team/team-filters';
import type { TeamProfile } from 'csdm/common/types/team-profile';
import { fetchTeamHeatmapPointsHandler } from './renderer-process/team/fetch-team-heatmap-points-handler';
import {
  updateMatchesTeamNamesHandler,
  type MatchesTeamNamesUpdatedPayload,
  type UpdateMatchesTeamNamesPayload,
} from './renderer-process/match/update-matches-team-names-handler';
import { abortCurrentTaskHandler } from './renderer-process/abort-current-task-handler';
import {
  updatePlayersTagsHandler,
  type UpdatePlayersTagsPayload,
} from './renderer-process/tags/update-players-tags-handler';
import type { AddVideoPayload } from 'csdm/common/types/video';
import {
  updateSteamAccountNameHandler,
  type UpdateSteamAccountNamePayload,
} from './renderer-process/steam-accounts/update-steam-account-name-handler';
import { resumeVideoQueueHandler } from './renderer-process/video/resume-video-queue-handler';
import { pauseVideoQueueHandler } from './renderer-process/video/pause-video-queue-handler';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';
import { add5EPlayAccountHandler } from './renderer-process/5eplay/add-5eplay-account-handler';
import { updateCurrent5EPlayAccountHandler } from './renderer-process/5eplay/update-current-5eplay-account-handler';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';
import { fetchLast5EPlayMatchesHandler } from './renderer-process/5eplay/fetch-last-5eplay-matches-handler';
import { delete5EPlayAccountHandler } from './renderer-process/5eplay/delete-5eplay-account-handler';
import {
  exportMatchesChatMessagesHandler,
  type ExportMatchesChatMessagesPayload,
} from './renderer-process/match/export-matches-chat-messages-handler';
import {
  exportPlayersToXlsxHandler,
  type ExportPlayersToXlsxPayload,
} from './renderer-process/player/export-players-to-xlsx-handler';

export interface RendererMessageHandlers {
  [RendererClientMessageName.InitializeApplication]: Handler<void, InitializeApplicationSuccessPayload>;
  [RendererClientMessageName.IsCs2ConnectedToServer]: Handler<void, boolean>;
  [RendererClientMessageName.AbortCurrentTask]: Handler;
  [RendererClientMessageName.GetDatabaseSize]: Handler<void, string>;
  [RendererClientMessageName.ResetDatabase]: Handler;
  [RendererClientMessageName.OptimizeDatabase]: Handler<OptimizeDatabasePayload>;
  [RendererClientMessageName.FetchMatchesTable]: Handler<FetchMatchesTablePayload, MatchTable[]>;
  [RendererClientMessageName.FetchMatchByChecksum]: Handler<string, Match>;
  [RendererClientMessageName.FetchMatchHeatmapPoints]: Handler<MatchHeatmapFilter, Point[]>;
  [RendererClientMessageName.FetchTeamHeatmapPoints]: Handler<TeamHeatmapFilter, Point[]>;
  [RendererClientMessageName.Fetch2DViewerData]: Handler<Fetch2dViewerDataPayload, Fetch2dViewerDataSuccessPayload>;
  [RendererClientMessageName.UpdateComment]: Handler<UpdateCommentPayload>;
  [RendererClientMessageName.UpdatePlayerComment]: Handler<UpdatePlayerCommentPayload>;
  [RendererClientMessageName.InitializeVideo]: Handler<InitializeVideoPayload, InitializeVideoSuccessPayload>;
  [RendererClientMessageName.FetchDemosTable]: Handler<DemosTableFilter, Demo[]>;
  [RendererClientMessageName.LoadDemoByPath]: Handler<string, Demo>;
  [RendererClientMessageName.NavigateToDemoOrMatch]: Handler<string>;
  [RendererClientMessageName.FetchPlayersTable]: Handler<PlayersTableFilter, PlayerTable[]>;
  [RendererClientMessageName.FetchTeamsTable]: Handler<TeamsTableFilter, TeamTable[]>;
  [RendererClientMessageName.FetchTeam]: Handler<TeamFilters, TeamProfile>;
  [RendererClientMessageName.AddDemosToAnalyses]: Handler<Demo[]>;
  [RendererClientMessageName.RemoveDemosFromAnalyses]: Handler<string[]>;
  [RendererClientMessageName.GenerateMatchPositions]: Handler<GenerateMatchPositionsPayload>;
  [RendererClientMessageName.RenameDemo]: Handler<RenameDemoPayload>;
  [RendererClientMessageName.DeleteMatches]: Handler<string[]>;
  [RendererClientMessageName.DeleteIgnoredSteamAccount]: Handler<string>;
  [RendererClientMessageName.FetchLastValveMatches]: Handler;
  [RendererClientMessageName.AbortDownload]: Handler<string>;
  [RendererClientMessageName.AbortDownloads]: Handler;
  [RendererClientMessageName.AddDownload]: Handler<Download>;
  [RendererClientMessageName.AddDownloads]: Handler<Download[]>;
  [RendererClientMessageName.AddDownloadFromShareCode]: Handler<string>;
  [RendererClientMessageName.DeleteDemos]: Handler<Demo[], DeleteDemosResultPayload>;
  [RendererClientMessageName.UpdateDemosSource]: Handler<UpdateDemosSourcePayload>;
  [RendererClientMessageName.UpdateDemosType]: Handler<UpdateDemosTypePayload>;
  [RendererClientMessageName.ExportDemoPlayersVoice]: Handler<ExportDemoPlayersVoicePayload>;
  [RendererClientMessageName.UpdateMatchesType]: Handler<UpdateMatchesTypePayload>;
  [RendererClientMessageName.UpdateMatchesTeamNames]: Handler<
    UpdateMatchesTeamNamesPayload,
    MatchesTeamNamesUpdatedPayload
  >;
  [RendererClientMessageName.UpdateSteamAccountName]: Handler<UpdateSteamAccountNamePayload, string>;
  [RendererClientMessageName.ExportMatchesToXlsx]: Handler<ExportMatchesToXlsxPayload>;
  [RendererClientMessageName.ExportMatchesToJson]: Handler<ExportMatchesToJsonPayload>;
  [RendererClientMessageName.ExportPlayersToXlsx]: Handler<ExportPlayersToXlsxPayload>;
  [RendererClientMessageName.AddIgnoredSteamAccount]: Handler<string, IgnoredSteamAccount>;
  [RendererClientMessageName.AddMap]: Handler<MapPayload, Map>;
  [RendererClientMessageName.UpdateMap]: Handler<MapPayload, Map>;
  [RendererClientMessageName.DeleteMap]: Handler<Map>;
  [RendererClientMessageName.FetchBanStats]: Handler<void, BanStats>;
  [RendererClientMessageName.DisconnectDatabase]: Handler;
  [RendererClientMessageName.ConnectDatabase]: Handler<DatabaseSettings | undefined, ConnectDatabaseError | undefined>;
  [RendererClientMessageName.AddVideoToQueue]: Handler<AddVideoPayload>;
  [RendererClientMessageName.ResumeVideoQueue]: Handler;
  [RendererClientMessageName.PauseVideoQueue]: Handler;
  [RendererClientMessageName.UpdateMatchDemoLocation]: Handler<UpdateMatchDemoLocationPayload>;
  [RendererClientMessageName.InstallHlae]: Handler<void, string>;
  [RendererClientMessageName.UpdateHlae]: Handler<void, string>;
  [RendererClientMessageName.EnableHlaeCustomLocation]: Handler<string, HlaeVersionChangedPayload>;
  [RendererClientMessageName.DisableHlaeCustomLocation]: Handler<boolean, HlaeVersionChangedPayload>;
  [RendererClientMessageName.InstallVirtualDub]: Handler<void, string>;
  [RendererClientMessageName.InstallFfmpeg]: Handler<void, string>;
  [RendererClientMessageName.UpdateFfmpeg]: Handler<void, string>;
  [RendererClientMessageName.EnableFfmpegCustomLocation]: Handler<string, FfmpegVersionChangedPayload>;
  [RendererClientMessageName.DisableFfmpegCustomLocation]: Handler<boolean, FfmpegVersionChangedPayload>;
  [RendererClientMessageName.RemoveVideosFromQueue]: Handler<string[]>;
  [RendererClientMessageName.FetchMatchFlashbangMatrixRows]: Handler<string, FlashbangMatrixRow[]>;
  [RendererClientMessageName.FetchMatchDuelsMatrixRows]: Handler<string, DuelMatrixRow[]>;
  [RendererClientMessageName.FetchMatchGrenadesThrow]: Handler<string, GrenadeThrow[]>;
  [RendererClientMessageName.WatchDemo]: Handler<WatchDemoPayload, WatchDemoErrorPayload | undefined>;
  [RendererClientMessageName.WatchPlayerRounds]: Handler<WatchPlayerRoundsPayload, WatchDemoErrorPayload | undefined>;
  [RendererClientMessageName.WatchPlayerHighlights]: Handler<
    WatchPlayerHighlightsPayload,
    WatchDemoErrorPayload | undefined
  >;
  [RendererClientMessageName.WatchPlayerLowlights]: Handler<
    WatchPlayerLowlightsPayload,
    WatchDemoErrorPayload | undefined
  >;
  [RendererClientMessageName.WatchPlayerAsSuspect]: Handler<
    WatchPlayerAsSuspectPayload,
    WatchDemoErrorPayload | undefined
  >;
  [RendererClientMessageName.ExportMatchChatMessages]: Handler<ExportChatMessagesPayload, boolean>;
  [RendererClientMessageName.ExportMatchesChatMessages]: Handler<ExportMatchesChatMessagesPayload, boolean>;
  [RendererClientMessageName.WriteBase64File]: Handler<WriteBase64FilePayload>;
  [RendererClientMessageName.FetchPlayerStats]: Handler<FetchPlayerPayload, PlayerProfile>;
  [RendererClientMessageName.InsertTag]: Handler<Omit<Tag, 'id'>, Tag>;
  [RendererClientMessageName.UpdateTag]: Handler<Tag>;
  [RendererClientMessageName.DeleteTag]: Handler<ColumnID>;
  [RendererClientMessageName.UpdateChecksumTags]: Handler<UpdateChecksumsTagsPayload>;
  [RendererClientMessageName.UpdatePlayersTags]: Handler<UpdatePlayersTagsPayload>;
  [RendererClientMessageName.UpdateRoundTags]: Handler<UpdateRoundTagsPayload>;
  [RendererClientMessageName.IsCsRunning]: Handler<void, boolean>;
  [RendererClientMessageName.ResetMaps]: Handler<Game, Map[]>;
  [RendererClientMessageName.ResetTablesState]: Handler;
  [RendererClientMessageName.FetchLastFaceitMatches]: Handler<string, FaceitMatch[]>;
  [RendererClientMessageName.AddFaceitAccount]: Handler<string, FaceitAccount>;
  [RendererClientMessageName.UpdateCurrentFaceitAccount]: Handler<string, FaceitAccount[]>;
  [RendererClientMessageName.DeleteFaceitAccount]: Handler<string, FaceitAccount[]>;
  [RendererClientMessageName.SearchEvent]: Handler<SearchPayload, SearchResult>;
  [RendererClientMessageName.SearchPlayers]: Handler<PlayersFilter, PlayerResult[]>;
  [RendererClientMessageName.SearchMaps]: Handler<MapNamesFilter, string[]>;
  [RendererClientMessageName.FetchLastMigrations]: Handler<void, Migration[]>;
  [RendererClientMessageName.DeleteDemosFromDatabase]: Handler<string[]>;
  [RendererClientMessageName.ImportDataFromV2Backup]: Handler<ImportV2BackupOptions, ImportV2BackupResult>;
  [RendererClientMessageName.FetchLast5EPlayMatches]: Handler<string, FiveEPlayMatch[]>;
  [RendererClientMessageName.Add5EPlayAccount]: Handler<string, FiveEPlayAccount>;
  [RendererClientMessageName.Delete5EPlayAccount]: Handler<string, FiveEPlayAccount[]>;
  [RendererClientMessageName.UpdateCurrent5EPlayAccount]: Handler<string, FiveEPlayAccount[]>;
}

// Mapping between message names and server handlers sent from the Electron renderer process to the WebSocket server.
export const rendererHandlers: RendererMessageHandlers = {
  [RendererClientMessageName.InitializeApplication]: initializeApplicationHandler,
  [RendererClientMessageName.IsCs2ConnectedToServer]: isCs2ConnectedToServerHandler,
  [RendererClientMessageName.AbortCurrentTask]: abortCurrentTaskHandler,
  [RendererClientMessageName.GetDatabaseSize]: getDatabaseSizeHandler,
  [RendererClientMessageName.ResetDatabase]: resetDatabaseHandler,
  [RendererClientMessageName.OptimizeDatabase]: optimizeDatabaseHandler,
  [RendererClientMessageName.FetchMatchesTable]: fetchMatchesTableHandler,
  [RendererClientMessageName.FetchMatchByChecksum]: fetchMatchByChecksumHandler,
  [RendererClientMessageName.FetchMatchHeatmapPoints]: fetchMatchHeatmapPointsHandler,
  [RendererClientMessageName.FetchTeamHeatmapPoints]: fetchTeamHeatmapPointsHandler,
  [RendererClientMessageName.Fetch2DViewerData]: fetch2DViewerDataHandler,
  [RendererClientMessageName.UpdateComment]: updateCommentHandler,
  [RendererClientMessageName.UpdatePlayerComment]: updatePlayerCommentHandler,
  [RendererClientMessageName.InitializeVideo]: initializeVideoHandler,
  [RendererClientMessageName.FetchDemosTable]: fetchDemosTableHandler,
  [RendererClientMessageName.LoadDemoByPath]: loadDemoHandler,
  [RendererClientMessageName.NavigateToDemoOrMatch]: navigateToDemoOrMatch,
  [RendererClientMessageName.FetchPlayersTable]: fetchPlayersHandler,
  [RendererClientMessageName.FetchTeamsTable]: fetchTeamsTableHandler,
  [RendererClientMessageName.FetchTeam]: fetchTeamHandler,
  [RendererClientMessageName.AddDemosToAnalyses]: addDemosToAnalysesHandler,
  [RendererClientMessageName.RemoveDemosFromAnalyses]: removeDemosFromAnalysesHandler,
  [RendererClientMessageName.GenerateMatchPositions]: generateMatchPositionsHandler,
  [RendererClientMessageName.RenameDemo]: renameDemoHandler,
  [RendererClientMessageName.DeleteMatches]: deleteMatchesHandler,
  [RendererClientMessageName.DeleteIgnoredSteamAccount]: deleteIgnoredSteamAccountHandler,
  [RendererClientMessageName.FetchLastValveMatches]: fetchLastValveMatchesHandler,
  [RendererClientMessageName.AbortDownload]: abortDownloadHandler,
  [RendererClientMessageName.AbortDownloads]: abortDownloadsHandler,
  [RendererClientMessageName.AddDownload]: addDownloadHandler,
  [RendererClientMessageName.AddDownloads]: addDownloadsHandler,
  [RendererClientMessageName.AddDownloadFromShareCode]: addDownloadFromShareCodeHandler,
  [RendererClientMessageName.DeleteDemos]: deleteDemosHandler,
  [RendererClientMessageName.UpdateDemosType]: updateDemosTypeHandler,
  [RendererClientMessageName.UpdateDemosSource]: updateDemosSourceHandler,
  [RendererClientMessageName.ExportDemoPlayersVoice]: exportDemoPlayersVoiceHandler,
  [RendererClientMessageName.UpdateMatchesType]: updateMatchesTypeHandler,
  [RendererClientMessageName.UpdateMatchesTeamNames]: updateMatchesTeamNamesHandler,
  [RendererClientMessageName.UpdateSteamAccountName]: updateSteamAccountNameHandler,
  [RendererClientMessageName.ExportMatchesToXlsx]: exportMatchesToXlsxHandler,
  [RendererClientMessageName.ExportMatchesToJson]: exportMatchesToJsonHandler,
  [RendererClientMessageName.ExportPlayersToXlsx]: exportPlayersToXlsxHandler,
  [RendererClientMessageName.AddIgnoredSteamAccount]: addIgnoredSteamAccountHandler,
  [RendererClientMessageName.AddMap]: addMapHandler,
  [RendererClientMessageName.UpdateMap]: updateMapHandler,
  [RendererClientMessageName.DeleteMap]: deleteMapHandler,
  [RendererClientMessageName.FetchBanStats]: fetchBanStatsHandler,
  [RendererClientMessageName.DisconnectDatabase]: disconnectDatabaseConnectionHandler,
  [RendererClientMessageName.ConnectDatabase]: connectDatabaseHandler,
  [RendererClientMessageName.AddVideoToQueue]: addVideoToQueueHandler,
  [RendererClientMessageName.ResumeVideoQueue]: resumeVideoQueueHandler,
  [RendererClientMessageName.PauseVideoQueue]: pauseVideoQueueHandler,
  [RendererClientMessageName.UpdateMatchDemoLocation]: updateMatchDemoLocationHandler,
  [RendererClientMessageName.InstallHlae]: installHlaeHandler,
  [RendererClientMessageName.UpdateHlae]: updateHlaeHandler,
  [RendererClientMessageName.EnableHlaeCustomLocation]: enableHlaeCustomLocationHandler,
  [RendererClientMessageName.DisableHlaeCustomLocation]: disableHlaeCustomLocationHandler,
  [RendererClientMessageName.InstallVirtualDub]: installVirtualDubHandler,
  [RendererClientMessageName.InstallFfmpeg]: installFfmpegHandler,
  [RendererClientMessageName.UpdateFfmpeg]: updateFfmpegHandler,
  [RendererClientMessageName.EnableFfmpegCustomLocation]: enableFfmpegCustomLocationHandler,
  [RendererClientMessageName.DisableFfmpegCustomLocation]: disableFfmpegCustomLocationHandler,
  [RendererClientMessageName.RemoveVideosFromQueue]: removeVideosFromQueueHandler,
  [RendererClientMessageName.FetchMatchFlashbangMatrixRows]: fetchMatchFlashbangMatrixRowsHandler,
  [RendererClientMessageName.FetchMatchDuelsMatrixRows]: fetchMatchDuelsMatrixRowsHandler,
  [RendererClientMessageName.FetchMatchGrenadesThrow]: fetchMatchGrenadesThrowHandler,
  [RendererClientMessageName.WatchDemo]: watchDemoHandler,
  [RendererClientMessageName.WatchPlayerRounds]: watchPlayerRoundsHandler,
  [RendererClientMessageName.WatchPlayerHighlights]: watchPlayerHighlightsHandler,
  [RendererClientMessageName.WatchPlayerLowlights]: watchPlayerLowlightsHandler,
  [RendererClientMessageName.WatchPlayerAsSuspect]: watchPlayerAsSuspectHandler,
  [RendererClientMessageName.ExportMatchChatMessages]: exportMatchChatMessagesHandler,
  [RendererClientMessageName.ExportMatchesChatMessages]: exportMatchesChatMessagesHandler,
  [RendererClientMessageName.WriteBase64File]: writeBase64FileHandler,
  [RendererClientMessageName.FetchPlayerStats]: fetchPlayerHandler,
  [RendererClientMessageName.InsertTag]: insertTagHandler,
  [RendererClientMessageName.UpdateTag]: updateTagHandler,
  [RendererClientMessageName.DeleteTag]: deleteTagHandler,
  [RendererClientMessageName.UpdateChecksumTags]: updateChecksumsTagsHandler,
  [RendererClientMessageName.UpdatePlayersTags]: updatePlayersTagsHandler,
  [RendererClientMessageName.UpdateRoundTags]: updateRoundTagsHandler,
  [RendererClientMessageName.IsCsRunning]: isCounterStrikeRunningHandler,
  [RendererClientMessageName.ResetMaps]: resetMapsHandler,
  [RendererClientMessageName.ResetTablesState]: resetTablesStateHandler,
  [RendererClientMessageName.FetchLastFaceitMatches]: fetchLastFaceitMatchesHandler,
  [RendererClientMessageName.AddFaceitAccount]: addFaceitAccountHandler,
  [RendererClientMessageName.UpdateCurrentFaceitAccount]: updateCurrentFaceitAccountHandler,
  [RendererClientMessageName.DeleteFaceitAccount]: deleteFaceitAccountHandler,
  [RendererClientMessageName.SearchEvent]: searchHandler,
  [RendererClientMessageName.SearchPlayers]: searchPlayersHandler,
  [RendererClientMessageName.SearchMaps]: searchMapNamesHandler,
  [RendererClientMessageName.FetchLastMigrations]: fetchMigrationsHandler,
  [RendererClientMessageName.DeleteDemosFromDatabase]: deleteDemosFromDatabaseHandler,
  [RendererClientMessageName.ImportDataFromV2Backup]: importDataFromV2BackupHandler,
  [RendererClientMessageName.FetchLast5EPlayMatches]: fetchLast5EPlayMatchesHandler,
  [RendererClientMessageName.Add5EPlayAccount]: add5EPlayAccountHandler,
  [RendererClientMessageName.Delete5EPlayAccount]: delete5EPlayAccountHandler,
  [RendererClientMessageName.UpdateCurrent5EPlayAccount]: updateCurrent5EPlayAccountHandler,
};
