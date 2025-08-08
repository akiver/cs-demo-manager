import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import type { Page } from 'csdm/node/settings/page';
import type { ThemeName } from 'csdm/common/types/theme-name';
import type { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import type { RankingFilter } from 'csdm/common/types/ranking-filter';
import type { DemosTableFilter } from 'csdm/node/database/demos/demos-table-filter';
import type { PlayersTableFilter } from 'csdm/node/database/players/players-table-filter';
import type { VideoContainer } from 'csdm/common/types/video-container';
import type { TeamsTableFilter } from 'csdm/node/database/teams/teams-table-filter';
import type { RecordingSystem } from 'csdm/common/types/recording-system';
import type { RecordingOutput } from 'csdm/common/types/recording-output';

export type Folder = {
  path: string;
  includeSubFolders: boolean;
};

export type DatabaseSettings = {
  readonly hostname: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
};

type DemosSettings = DemosTableFilter & {
  showAllFolders: boolean;
  currentFolderPath: string;
};

type UISettings = {
  // Comes from the Electron API app.getLocale();
  // Possible values https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc
  locale: string;
  theme: ThemeName;
  initialPage: Page;
  redirectDemoToMatch: boolean;
};

type AnalyzeSettings = {
  analyzePositions: boolean;
};

export type HlaeSettings = {
  customLocationEnabled: boolean;
  customExecutableLocation: string;
  configFolderEnabled: boolean;
  configFolderPath: string;
  parameters?: string | undefined;
};

type PlaybackTypeSettings = {
  beforeKillDelayInSeconds: number; // how many seconds the playback should start before a kill
  afterKillDelayInSeconds: number; // how many seconds to wait before skipping to the next kill
  includeDamages: boolean; // When enabled, sequences where the player didn't necessarily had a kill but only a large amount of damage will be included.
};

export type PlaybackSettings = {
  height: number;
  width: number;
  fullscreen: boolean;
  useCustomHighlights: boolean;
  useCustomLowlights: boolean;
  highlights: PlaybackTypeSettings;
  lowlights: PlaybackTypeSettings;
  round: {
    beforeRoundDelayInSeconds: number; // how many seconds the playback should start before the end of rounds freeze time
    afterRoundDelayInSeconds: number; // how many seconds to wait before skipping to the next round (on round end or player death)
  };
  launchParameters: string;
  useHlae: boolean;
  playerVoicesEnabled: boolean;
  cs2PluginVersion?: string;
  customCs2LocationEnabled?: boolean;
  cs2ExecutablePath?: string;
  customCsgoLocationEnabled?: boolean;
  csgoExecutablePath?: string;
};

export type PlayerProfileSettings = {
  demoSources: DemoSource[];
  games: Game[];
  demoTypes: DemoType[];
  ranking: RankingFilter;
  gameModes: GameMode[];
  tagIds: string[];
  maxRounds: number[];
  startDate: string | undefined;
  endDate: string | undefined;
};

export type FfmpegSettings = {
  audioBitrate: number;
  // ! Has no effect when outputParameters is set
  constantRateFactor: number;
  customLocationEnabled: boolean;
  customExecutableLocation: string;
  videoContainer: VideoContainer;
  videoCodec: string;
  audioCodec: string;
  inputParameters: string;
  outputParameters: string;
};

type DownloadSettings = {
  folderPath: string | undefined;
  downloadValveDemosAtStartup: boolean;
  downloadFaceitDemosAtStartup: boolean;
  downloadValveDemosInBackground: boolean;
  downloadFaceitDemosInBackground: boolean;
  download5EPlayDemosAtStartup: boolean;
  download5EPlayDemosInBackground: boolean;
};

export type MatchesSettings = MatchFilters;

export type PlayersSettings = PlayersTableFilter;

export type TeamsSettings = TeamsTableFilter;

export type TeamProfileSettings = {
  demoSources: DemoSource[];
  games: Game[];
  demoTypes: DemoType[];
  gameModes: GameMode[];
  tagIds: string[];
  maxRounds: number[];
  startDate: string | undefined;
  endDate: string | undefined;
};

export type VideoSettings = {
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  encoderSoftware: EncoderSoftware;
  framerate: number;
  width: number;
  height: number;
  closeGameAfterRecording: boolean;
  showOnlyDeathNotices: boolean;
  showXRay: boolean;
  concatenateSequences: boolean;
  playerVoicesEnabled: boolean;
  ffmpegSettings: FfmpegSettings;
  outputFolderPath: string;
  // @platform win32 Requires HLAE
  // How long death notices will be displayed in seconds by default. It can be overridden in the sequence settings.
  deathNoticesDuration: number;
  hlae: HlaeSettings;
};

type BanSettings = {
  ignoreBanBeforeFirstSeen: boolean;
};

export type Settings = {
  schemaVersion: number;
  autoDownloadUpdates: boolean;
  database: DatabaseSettings;
  folders: Folder[];
  demos: DemosSettings;
  steamApiKey: string;
  faceitApiKey: string;
  ui: UISettings;
  analyze: AnalyzeSettings;
  playback: PlaybackSettings;
  playerProfile: PlayerProfileSettings;
  pinnedPlayerSteamId: string;
  video: VideoSettings;
  download: DownloadSettings;
  matches: MatchesSettings;
  players: PlayersSettings;
  teams: TeamsSettings;
  teamProfile: TeamProfileSettings;
  ban: BanSettings;
};
