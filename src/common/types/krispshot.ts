/**
 * KrispShot build of CS Demo Manager — clip worker types shared by the server and the UI.
 * The worker takes clip jobs from the krispshot.in website (/api/clips/worker/*), records them with this app's own
 * analysis + video queues, adds the HUD lower third and uploads the MP4. See src/server/krispshot/krispshot-worker.ts.
 */

export type KrispShotSettings = {
  enabled: boolean;
  siteUrl: string;
  workerKey: string;
  workerName: string;
  // Passed to the demo analyzer, KrispShot servers record with MatchZy.
  demoSource: string;
  // Keep each job's files after the upload (for debugging).
  keepFiles: boolean;
  // Demos kept on disk, more clips from the same match don't download it again.
  demoCacheSize: number;
  // Custom Edge / Chrome executable used to draw the HUD, auto-detected when empty.
  browserPath: string;
};

export const KrispShotWorkerState = {
  Disabled: 'disabled',
  NotConfigured: 'not-configured',
  Idle: 'idle',
  Working: 'working',
  Offline: 'offline',
} as const;
export type KrispShotWorkerState = (typeof KrispShotWorkerState)[keyof typeof KrispShotWorkerState];

export type KrispShotJobStatus =
  | 'CLAIMED'
  | 'DOWNLOADING'
  | 'ANALYZING'
  | 'RECORDING'
  | 'RENDERING'
  | 'UPLOADING'
  | 'DONE'
  | 'FAILED'
  | 'CANCELLED';

export type KrispShotCurrentJob = {
  id: string;
  playerName: string;
  map: string;
  rounds: number[];
  killCount: number;
  status: KrispShotJobStatus;
  progress: number;
  message: string;
  startedAt: string;
};

export type KrispShotStatus = {
  state: KrispShotWorkerState;
  message: string;
  currentJob: KrispShotCurrentJob | null;
  lastJob: { id: string; ok: boolean; message: string; finishedAt: string } | null;
  completedCount: number;
  failedCount: number;
  log: string[];
};

export type KrispShotState = {
  settings: KrispShotSettings;
  status: KrispShotStatus;
};

export type KrispShotSegment = { startTick: number; endTick: number; round: number };

/** What the website hands out (src/lib/clips/types.ts ClipWorkerJob on krispshot.in). */
export type KrispShotClipJob = {
  v: 1;
  id: string;
  matchId: string;
  demoUrl: string;
  map: string;
  tickrate: number;
  steamId: string;
  playerName: string;
  rounds: number[];
  segments: KrispShotSegment[];
  kills: { tick: number; round: number; weapon: string; weaponLabel: string; headshot: boolean; victim: string }[];
  recording: {
    framerate: number;
    width: number;
    height: number;
    recordingSystem: 'HLAE' | 'CS';
    showOnlyDeathNotices: boolean;
    killfeed: 'player' | 'all';
    deathNoticesSeconds: number;
    playerVoices: boolean;
    trueView: boolean;
    cfg: string;
  };
  hud: {
    enabled: boolean;
    color: string;
    position: 'left' | 'right';
    startSeconds: number;
    glow: number;
    shake: number;
    size: number;
    name: string;
    team: string;
    badge: string;
    badgeSub: string;
    kills: number;
    info: string;
  };
  output: { crf: number; audioKbps: number };
};
