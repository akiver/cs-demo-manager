// Message names sent from the renderer Electron process to the WebSocket server.
export const RendererClientMessageName = {
  InitializeApplication: 'init-application',
  IsCs2ConnectedToServer: 'is-cs2-connected-to-server',
  AbortCurrentTask: 'abort-current-task',
  GetDatabaseSize: 'get-database-size',
  ResetDatabase: 'reset-database',
  OptimizeDatabase: 'optimize-database',
  FetchMatchesTable: 'fetch-matches-table',
  FetchMatchByChecksum: 'fetch-match-by-checksum',
  FetchMatchGrenadesThrow: 'fetch-match-grenades-throw',
  FetchMatchFlashbangMatrixRows: 'fetch-match-flashbang-matrix-rows',
  FetchMatchDuelsMatrixRows: 'fetch-match-duels-matrix-rows',
  FetchMatchHeatmapPoints: 'fetch-match-heatmap-points',
  Fetch2DViewerData: 'fetch-2d-viewer-data',
  UpdateComment: 'update-match-comment',
  UpdatePlayerComment: 'update-player-comment',
  UpdateMatchDemoLocation: 'update-match-demo-location',
  InitializeVideo: 'initialize-video',
  ExportMatchChatMessages: 'export-match-chat-messages',
  ExportMatchesChatMessages: 'export-matches-chat-messages',
  FetchDemosTable: 'fetch-demos-table',
  LoadDemoByPath: 'load-demo-by-path',
  NavigateToDemoOrMatch: 'navigate-to-demo-or-match',
  FetchPlayersTable: 'fetch-players-table',
  FetchPlayerStats: 'fetch-player-stats',
  FetchTeamsTable: 'fetch-teams-table',
  FetchTeam: 'fetch-team',
  FetchTeamHeatmapPoints: 'fetch-team-heatmap-points',
  AddDemosToAnalyses: 'add-demos-to-analyses',
  RemoveDemosFromAnalyses: 'remove-demos-from-analyses',
  GenerateMatchPositions: 'generate-match-positions',
  RenameDemo: 'rename-demo',
  DeleteMatches: 'delete-matches',
  FetchBanStats: 'fetch-ban-stats',
  AddIgnoredSteamAccount: 'add-ignored-steam-account',
  DeleteIgnoredSteamAccount: 'delete-ignored-steam-account',
  FetchLastValveMatches: 'fetch-last-valve-matches',
  AddDownload: 'add-download',
  AddDownloads: 'add-downloads',
  AbortDownload: 'abort-download',
  AbortDownloads: 'abort-downloads',
  AddDownloadFromShareCode: 'add-download-from-share-code',
  DeleteDemos: 'delete-demos',
  UpdateDemosSource: 'update-demos-source',
  UpdateDemosType: 'update-demos-type',
  ExportDemoPlayersVoice: 'export-demo-players-voice',
  UpdateMatchesType: 'update-matches-type',
  UpdateMatchesTeamNames: 'update-matches-team-names',
  UpdateSteamAccountName: 'update-steam-account-name',
  ExportMatchesToXlsx: 'export-matches-to-xslx',
  ExportMatchesToJson: 'export-matches-to-json',
  AddMap: 'add-map',
  UpdateMap: 'update-map',
  DeleteMap: 'delete-map',
  ResetMaps: 'reset-maps',
  WatchDemo: 'watch-demo',
  WatchPlayerRounds: 'watch-player-rounds',
  WatchPlayerHighlights: 'watch-player-highlights',
  WatchPlayerLowlights: 'watch-player-lowlights',
  WatchPlayerAsSuspect: 'watch-player-as-suspect',
  DisconnectDatabase: 'disconnect-database',
  ConnectDatabase: 'connect-database',
  AddVideoToQueue: 'add-video-to-queue',
  ResumeVideoQueue: 'resume-video-queue',
  PauseVideoQueue: 'pause-video-queue',
  InstallHlae: 'install-hlae',
  UpdateHlae: 'update-hlae',
  EnableHlaeCustomLocation: 'enable-hlae-custom-location',
  DisableHlaeCustomLocation: 'disable-hlae-custom-location',
  InstallVirtualDub: 'install-virtual-dub',
  InstallFfmpeg: 'install-ffmpeg',
  UpdateFfmpeg: 'update-ffmpeg',
  EnableFfmpegCustomLocation: 'enable-ffmpeg-custom-location',
  DisableFfmpegCustomLocation: 'disable-ffmpeg-custom-location',
  RemoveVideosFromQueue: 'remove-videos-from-queue',
  WriteBase64File: 'write-base64-file',
  InsertTag: 'insert-tag',
  UpdateTag: 'update-tag',
  DeleteTag: 'delete-tag',
  UpdateChecksumTags: 'update-checksums-tags',
  UpdatePlayersTags: 'update-players-tags',
  UpdateRoundTags: 'update-round-tags',
  IsCsRunning: 'is-cs-running',
  ResetTablesState: 'reset-tables-state',
  FetchLastFaceitMatches: 'fetch-last-faceit-matches',
  AddFaceitAccount: 'add-faceit-account',
  UpdateCurrentFaceitAccount: 'update-current-faceit-account',
  DeleteFaceitAccount: 'delete-faceit-account',
  FetchLast5EPlayMatches: 'fetch-last-5eplay-matches',
  Add5EPlayAccount: 'add-5eplay-account',
  Delete5EPlayAccount: 'delete-5eplay-account',
  UpdateCurrent5EPlayAccount: 'update-current-5eplay-account',
  SearchEvent: 'search-event',
  SearchPlayers: 'search-players',
  SearchMaps: 'search-maps',
  FetchLastMigrations: 'fetch-last-migrations',
  DeleteDemosFromDatabase: 'delete-demos-from-database',
  ImportDataFromV2Backup: 'import-data-from-v2-backup',
} as const;

export type RendererClientMessageName = (typeof RendererClientMessageName)[keyof typeof RendererClientMessageName];
