import fs from 'fs-extra';
import path from 'node:path';
import { server } from 'csdm/server/server';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { videoQueue } from 'csdm/server/video-queue';
import { analysesListener } from 'csdm/server/analyses-listener';
import { ensureDatabaseConnection } from 'csdm/server/ensure-database-connection';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { getErrorCodeMessage } from 'csdm/cli/get-error-code-message';
import { ErrorCode } from 'csdm/common/error-code';
import { VideoStatus } from 'csdm/common/types/video-status';
import type { AddVideoPayload, Video } from 'csdm/common/types/video';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import type { Demo } from 'csdm/common/types/demo';
import { SupportedDemoSourcesPerGame } from 'csdm/common/counter-strike/supported-demo-sources';
import {
  KrispShotWorkerState,
  type KrispShotClipJob,
  type KrispShotCurrentJob,
  type KrispShotJobStatus,
  type KrispShotSettings,
  type KrispShotState,
  type KrispShotStatus,
} from 'csdm/common/types/krispshot';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { isHlaeInstalled } from 'csdm/node/video/hlae/is-hlae-installed';
import { installHlae } from 'csdm/node/video/hlae/install-hlae';
import { isFfmpegInstalled } from 'csdm/node/video/ffmpeg/is-ffmpeg-installed';
import { installFfmpeg } from 'csdm/node/video/ffmpeg/install-ffmpeg';
import { getFfmpegExecutablePath } from 'csdm/node/video/ffmpeg/ffmpeg-location';
import { assertVideoGenerationIsPossible } from 'csdm/node/video/generation/assert-video-generation-is-possible';
import { isWindows } from 'csdm/node/os/is-windows';
import {
  defaultKrispShotSettings,
  getKrispShotFolderPath,
  getKrispShotSettings,
  isKrispShotConfigured,
  isSafeGamePath,
  writeKrispShotSettings,
} from 'csdm/node/krispshot/krispshot-settings';
import { SiteApi, SiteApiError } from 'csdm/node/krispshot/site-api';
import { downloadMatchDemo } from 'csdm/node/krispshot/download-demo';
import { buildClipVideo } from 'csdm/node/krispshot/build-clip-video';
import { findBrowserExecutable } from 'csdm/node/krispshot/cdp-browser';
import { renderHudFrames, type HudFrames } from 'csdm/node/krispshot/render-hud-frames';
import { composeClip, createThumbnail, probeVideo, type ClipPart } from 'csdm/node/krispshot/compose-clip';

const POLL_INTERVAL_MS = 5_000;
const HEARTBEAT_INTERVAL_MS = 10_000;
const LOG_SIZE = 150;

class JobCancelled extends Error {}

class JobError extends Error {
  public constructor(
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}

function tail(text: string, lineCount = 20) {
  return text
    .split(/\r?\n|\r/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '')
    .slice(-lineCount)
    .join('\n');
}

async function findSequenceVideos(folderPath: string): Promise<string[]> {
  const found: { filePath: string; number: number; size: number; named: boolean }[] = [];
  const walk = async (folder: string) => {
    const entries = await fs.readdir(folder, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (/\.(mkv|mp4|mov|avi)$/i.test(entry.name)) {
        const match = /^sequence-(\d+)-tick-/.exec(entry.name);
        const { size } = await fs.stat(entryPath);
        found.push({ filePath: entryPath, number: match ? Number(match[1]) : 1e9, size, named: match !== null });
      }
    }
  };
  await walk(folderPath);
  const named = found.filter((file) => file.named);

  return (named.length > 0 ? named : found)
    .sort((a, b) => a.number - b.number || b.size - a.size)
    .map((file) => file.filePath);
}

/**
 * KrispShot clip worker. Runs inside the daemon while it's enabled in Settings → KrispShot:
 *   claim a job on krispshot.in → download the demo → analyze it (this app's analysis queue)
 *   → record it (this app's video queue: HLAE, game audio, FFmpeg) → HUD lower third + final MP4 → upload.
 * One job at a time; the website also hands out only one job at a time.
 */
class KrispShotWorker {
  private settings: KrispShotSettings = { ...defaultKrispShotSettings };
  private status: KrispShotStatus = {
    state: KrispShotWorkerState.Disabled,
    message: 'Disabled',
    currentJob: null,
    lastJob: null,
    completedCount: 0,
    failedCount: 0,
    log: [],
  };
  private isLoopRunning = false;
  private wakeUp: (() => void) | null = null;
  private jobAbortController: AbortController | null = null;
  private jobAbortReason: 'website' | 'disabled' | null = null;
  private pushTimeout: NodeJS.Timeout | null = null;

  public isEnabled() {
    return this.settings.enabled;
  }

  public isBusy() {
    return this.status.currentJob !== null;
  }

  public getState(): KrispShotState {
    return { settings: this.settings, status: this.status };
  }

  public async start() {
    try {
      this.settings = await getKrispShotSettings();
      if (this.settings.enabled) {
        this.log(`Clip worker enabled · ${this.settings.siteUrl} as "${this.settings.workerName}"`);
        this.log(`Work folder: ${getKrispShotFolderPath(this.settings)}`);
        this.ensureLoop();
      }
      this.pushStatus();
    } catch (error) {
      logger.error('[krispshot] Failed to start the clip worker');
      logger.error(error);
    }
  }

  public async updateSettings(patch: Partial<KrispShotSettings>) {
    const wasEnabled = this.settings.enabled;
    this.settings = await writeKrispShotSettings(patch);
    if (this.settings.enabled) {
      if (!wasEnabled) {
        this.log('Clip worker enabled');
      }
      this.ensureLoop();
      this.wakeUp?.();
    } else if (wasEnabled) {
      this.log('Clip worker disabled');
      if (this.jobAbortController) {
        this.jobAbortReason = 'disabled';
        this.jobAbortController.abort();
      }
      this.wakeUp?.();
      this.setState(KrispShotWorkerState.Disabled, 'Disabled');
    }
    this.pushStatus();

    return this.getState();
  }

  public async testConnection(patch: Partial<KrispShotSettings>) {
    const settings = { ...this.settings, ...patch };
    if (!isKrispShotConfigured(settings)) {
      throw new Error('Enter the website address and the recorder key first.');
    }
    await new SiteApi(settings).ping();
    const browser = findBrowserExecutable(settings.browserPath);

    return browser
      ? `Connected to ${settings.siteUrl}. HUD browser: ${path.basename(browser)}.`
      : `Connected to ${settings.siteUrl}, but no Edge / Chrome was found for the HUD: set the browser path.`;
  }

  /* ───────────────────────────── loop ───────────────────────────── */

  private ensureLoop() {
    if (this.isLoopRunning) {
      return;
    }
    this.isLoopRunning = true;
    void this.loop()
      .catch((error) => {
        logger.error('[krispshot] Worker loop crashed');
        logger.error(error);
      })
      .finally(() => {
        this.isLoopRunning = false;
        if (this.settings.enabled) {
          // Crashed while still enabled: start again shortly.
          setTimeout(() => this.ensureLoop(), POLL_INTERVAL_MS);
        }
      });
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(done, ms);
      function done() {
        clearTimeout(timeout);
        resolve();
      }
      this.wakeUp = () => {
        this.wakeUp = null;
        done();
      };
    });
  }

  private async loop() {
    let backoffSeconds = 0;
    while (this.settings.enabled) {
      if (!isKrispShotConfigured(this.settings)) {
        this.setState(KrispShotWorkerState.NotConfigured, 'Enter the website address and the recorder key');
        await this.sleep(10_000);
        continue;
      }

      try {
        const { job } = await new SiteApi(this.settings).claim();
        backoffSeconds = 0;
        if (job) {
          await this.runJob(job);
          continue;
        }
        this.setState(KrispShotWorkerState.Idle, 'Waiting for clips');
        await this.sleep(POLL_INTERVAL_MS);
      } catch (error) {
        backoffSeconds = Math.min(60, backoffSeconds === 0 ? 5 : backoffSeconds * 2);
        const reason = error instanceof Error ? error.message : String(error);
        const hint = error instanceof SiteApiError && error.status === 401 ? ' — copy the recorder key again' : '';
        this.setState(KrispShotWorkerState.Offline, `Website unreachable: ${reason}${hint}`);
        this.log(`Website unreachable (${reason}), retrying in ${backoffSeconds} s`);
        await this.sleep(backoffSeconds * 1000);
      }
    }
    this.setState(KrispShotWorkerState.Disabled, 'Disabled');
  }

  /* ───────────────────────────── one job ───────────────────────────── */

  private async runJob(job: KrispShotClipJob) {
    const api = new SiteApi(this.settings);
    const abortController = new AbortController();
    const { signal } = abortController;
    this.jobAbortController = abortController;
    this.jobAbortReason = null;
    const workFolderPath = getKrispShotFolderPath(this.settings);
    const jobFolderPath = path.join(workFolderPath, 'jobs', job.id);
    const startedAt = Date.now();
    const clipSeconds = job.segments.reduce((sum, s) => sum + (s.endTick - s.startTick) / (job.tickrate || 64), 0);
    const current: KrispShotCurrentJob = {
      id: job.id,
      playerName: job.playerName,
      map: job.map,
      rounds: job.rounds,
      killCount: job.kills.length,
      status: 'CLAIMED',
      progress: 1,
      message: 'Starting',
      startedAt: new Date().toISOString(),
    };
    this.status.currentJob = current;
    this.setState(KrispShotWorkerState.Working, `Making a clip for ${job.playerName}`);
    this.log(
      `▶ ${job.id} · ${job.playerName} · ${job.map} · round ${job.rounds.join(',')} · ${job.kills.length} kill(s) · ~${clipSeconds.toFixed(1)} s`,
    );

    let lastReportAt = 0;
    const report = async (force: boolean) => {
      if (!force && Date.now() - lastReportAt < 2500) {
        return;
      }
      lastReportAt = Date.now();
      try {
        const response = await api.progress(job.id, current.status, current.progress, current.message);
        if (response?.cancel && !signal.aborted) {
          this.log(`✖ ${job.id} was cancelled on the website, stopping`);
          this.jobAbortReason = 'website';
          abortController.abort();
        }
      } catch (error) {
        this.log(`Progress report failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    const set = (status: KrispShotJobStatus, progress: number, message: string) => {
      current.status = status;
      current.progress = Math.max(1, Math.min(99, Math.round(progress)));
      current.message = message;
      this.pushStatus();
      void report(false);
    };
    const throwIfCancelled = () => {
      if (signal.aborted) {
        throw new JobCancelled('Cancelled');
      }
    };
    const heartbeat = setInterval(() => void report(true), HEARTBEAT_INTERVAL_MS);

    try {
      await fs.remove(jobFolderPath);
      await fs.ensureDir(jobFolderPath);

      if (!isSafeGamePath(workFolderPath)) {
        throw new JobError(
          `The work folder "${workFolderPath}" has characters CS2 can't open demos from (like ' or ;). Set another work folder in Settings → KrispShot, e.g. C:\\KrispShot.`,
          false,
        );
      }

      // 1 — demo
      set('DOWNLOADING', 2, 'Downloading the demo');
      const { demoPath, cached } = await downloadMatchDemo({
        url: job.demoUrl,
        matchId: job.matchId,
        demosFolderPath: path.join(workFolderPath, 'demos'),
        keep: this.settings.demoCacheSize,
        signal,
        onProgress: (bytes, total) => {
          const mb = (value: number) => (value / 1048576).toFixed(0);
          set(
            'DOWNLOADING',
            2 + (total ? (bytes / total) * 13 : 5),
            `Downloading the demo (${mb(bytes)}${total ? ` / ${mb(total)}` : ''} MB)`,
          );
        },
      });
      this.log(cached ? `Demo (cached) ${demoPath}` : `Demo downloaded ${demoPath}`);
      throwIfCancelled();

      // 2 — analysis (this app's queue, as MatchZy)
      set('ANALYZING', 16, 'Analyzing the demo');
      await ensureDatabaseConnection();
      const demo = await getDemoFromFilePath(demoPath);
      demo.source = this.settings.demoSource as DemoSource;
      await this.analyzeDemo(demo, signal);
      throwIfCancelled();

      // 3 — HLAE / FFmpeg
      if (job.recording.recordingSystem === 'HLAE' && isWindows && !(await isHlaeInstalled())) {
        set('RECORDING', 20, 'Installing HLAE');
        this.log('Installing HLAE');
        await installHlae();
      }
      if (!(await isFfmpegInstalled())) {
        set('RECORDING', 22, 'Installing FFmpeg');
        this.log('Installing FFmpeg');
        await installFfmpeg();
      }
      throwIfCancelled();

      // 4 — recording (this app's video queue)
      set('RECORDING', 24, 'Starting CS2');
      const payload = buildClipVideo(job, demo, path.join(jobFolderPath, 'csdm'));
      await assertVideoGenerationIsPossible(payload);
      const recordStartedAt = Date.now();
      const expectedMs = (clipSeconds * 4 + 90 * job.segments.length) * 1000;
      const video = await this.recordVideo(payload, signal, (updated) => {
        switch (updated.status) {
          case VideoStatus.Recording: {
            const ratio = Math.min(0.95, (Date.now() - recordStartedAt) / expectedMs);
            set('RECORDING', Math.max(current.progress, 26 + ratio * 44), 'Recording in CS2');
            break;
          }
          case VideoStatus.MovingFiles:
            set('RECORDING', Math.max(current.progress, 70), 'Moving files');
            break;
          case VideoStatus.Converting: {
            const position = updated.currentSequencePosition ?? 1;
            set(
              'RECORDING',
              Math.max(current.progress, 70 + (position / job.segments.length) * 9),
              `Encoding part ${position} of ${job.segments.length}`,
            );
            break;
          }
        }
      });
      const files = (await findSequenceVideos(video.outputFolderPath)).slice(0, job.segments.length);
      if (files.length < job.segments.length) {
        throw new JobError(
          `The recording finished but ${files.length}/${job.segments.length} video file(s) were found in ${video.outputFolderPath}.`,
          true,
        );
      }
      this.log(`Recorded ${files.length} part(s)`);
      throwIfCancelled();

      // 5 — HUD + final MP4
      set('RENDERING', 80, 'Preparing the parts');
      const ffmpegPath = await getFfmpegExecutablePath();
      const parts: ClipPart[] = [];
      for (const filePath of files) {
        parts.push({ filePath, ...(await probeVideo(ffmpegPath, filePath)) });
      }
      const totalSeconds = parts.reduce((sum, part) => sum + part.duration, 0);
      if (totalSeconds < 0.5) {
        throw new JobError('The recorded video is empty.', true);
      }
      if (parts.some((part) => !part.hasAudio)) {
        this.log('Warning: a recorded part has no audio track, silence is used for it');
      }

      let hud: HudFrames | null = null;
      if (job.hud.enabled) {
        const browserPath = findBrowserExecutable(this.settings.browserPath);
        if (browserPath) {
          set('RENDERING', 82, 'Drawing the HUD');
          hud = await renderHudFrames({
            browserPath,
            hud: job.hud,
            framerate: job.recording.framerate,
            clipSeconds: totalSeconds,
            outputFolderPath: path.join(jobFolderPath, 'hud'),
            signal,
            onProgress: (ratio) => set('RENDERING', 82 + ratio * 6, 'Drawing the HUD'),
          });
        } else {
          this.log('Warning: no Edge / Chrome found, the clip is made without the HUD');
        }
      }
      throwIfCancelled();

      set('RENDERING', 88, 'Encoding the clip');
      const clipPath = path.join(jobFolderPath, 'clip.mp4');
      await composeClip({
        ffmpegPath,
        parts,
        hud,
        framerate: job.recording.framerate,
        crf: job.output.crf,
        audioKbps: job.output.audioKbps,
        outputPath: clipPath,
        signal,
        onProgress: (ratio) => set('RENDERING', 88 + ratio * 7, 'Encoding the clip'),
      });
      const final = await probeVideo(ffmpegPath, clipPath);
      throwIfCancelled();

      // 6 — upload
      set('UPLOADING', 95, 'Uploading');
      const thumbnailPath = path.join(jobFolderPath, 'thumb.jpg');
      const thumbnailAt = Math.min(Math.max(0, this.getFirstKillOffset(job, parts) + 0.15), Math.max(0, final.duration - 0.1));
      const hasThumbnail = await createThumbnail(ffmpegPath, clipPath, thumbnailAt, thumbnailPath).then(
        () => true,
        (error: Error) => {
          this.log(`Thumbnail skipped: ${error.message}`);
          return false;
        },
      );
      await api.upload(job.id, 'video', clipPath);
      if (hasThumbnail) {
        await api.upload(job.id, 'thumb', thumbnailPath).catch((error: Error) => {
          this.log(`Thumbnail upload failed: ${error.message}`);
        });
      }
      await api.complete(job.id, final.duration);

      const seconds = Math.round((Date.now() - startedAt) / 1000);
      this.log(`✔ ${job.id} done in ${seconds} s · ${final.duration.toFixed(1)} s clip`);
      this.status.completedCount++;
      this.status.lastJob = {
        id: job.id,
        ok: true,
        message: `${job.playerName} · ${final.duration.toFixed(1)} s`,
        finishedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (signal.aborted || error instanceof JobCancelled) {
        if (this.jobAbortReason === 'disabled') {
          this.log(`${job.id} stopped (worker disabled), it goes back into the queue`);
          await api.fail(job.id, 'The recorder was turned off while recording.', true).catch(() => undefined);
        } else {
          this.log(`${job.id} cancelled`);
        }
      } else {
        const message = this.describeError(error);
        const retryable = error instanceof JobError ? error.retryable : true;
        this.log(`✖ ${job.id} failed: ${message}`);
        logger.error('[krispshot] Clip job failed');
        logger.error(error);
        this.status.failedCount++;
        this.status.lastJob = { id: job.id, ok: false, message, finishedAt: new Date().toISOString() };
        await api.fail(job.id, message.slice(0, 1900), retryable).catch((reportError: Error) => {
          this.log(`Could not report the failure: ${reportError.message}`);
        });
      }
    } finally {
      clearInterval(heartbeat);
      this.jobAbortController = null;
      this.jobAbortReason = null;
      this.status.currentJob = null;
      if (!this.settings.keepFiles) {
        await fs.remove(jobFolderPath).catch(() => undefined);
      }
      this.pushStatus();
    }
  }

  /** Puts the demo in the database with this app's analysis queue (skipped when it's already there). */
  private async analyzeDemo(demo: Demo, signal: AbortSignal) {
    const checksums = await fetchMatchChecksums();
    if (checksums.includes(demo.checksum)) {
      this.log('Demo already analyzed');
      return;
    }
    if (!SupportedDemoSourcesPerGame[demo.game].includes(demo.source)) {
      throw new JobError(
        `The demo source "${demo.source}" isn't supported for this demo. Change it in Settings → KrispShot.`,
        false,
      );
    }

    let lastOutput = '';
    const captureOutput = () => {
      const analysis = analysesListener.getAnalyses().find(({ demoChecksum }) => demoChecksum === demo.checksum);
      if (analysis) {
        lastOutput = analysis.output;
      }
    };
    const captureInterval = setInterval(captureOutput, 500);
    try {
      await analysesListener.addDemosToAnalyses([demo]);
      // Already queued by someone else: wait until it leaves the queue.
      while (analysesListener.getAnalyses().some(({ demoChecksum }) => demoChecksum === demo.checksum)) {
        if (signal.aborted) {
          throw new JobCancelled('Cancelled');
        }
        captureOutput();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } finally {
      clearInterval(captureInterval);
    }

    const checksumsAfter = await fetchMatchChecksums();
    if (!checksumsAfter.includes(demo.checksum)) {
      throw new JobError(`The demo analysis failed.\n${tail(lastOutput)}`, false);
    }
    this.log('Demo analyzed');
  }

  /** Adds the video to this app's video queue (visible on the Videos page) and waits for it. */
  private recordVideo(payload: AddVideoPayload, signal: AbortSignal, onUpdate: (video: Video) => void) {
    return new Promise<Video>((resolve, reject) => {
      let videoId = '';
      const cleanup = () => {
        videoQueue.removeListener(listener);
        signal.removeEventListener('abort', onAbort);
      };
      const listener = (id: string, video: Video | undefined) => {
        if (id !== videoId) {
          return;
        }
        if (!video) {
          cleanup();
          reject(
            signal.aborted
              ? new JobCancelled('Cancelled')
              : new JobError('The video was removed from the CS Demo Manager queue.', false),
          );
          return;
        }
        if (video.status === VideoStatus.Success) {
          cleanup();
          resolve(video);
        } else if (video.status === VideoStatus.Error) {
          cleanup();
          const reason = video.errorCode !== undefined ? getErrorCodeMessage(video.errorCode) : 'Recording failed';
          reject(new JobError(`${reason}${video.output ? `\n${tail(video.output, 15)}` : ''}`, true));
        } else {
          onUpdate(video);
        }
      };
      const onAbort = () => {
        // Aborts the generation: CS Demo Manager stops the game and cleans up.
        videoQueue.removeVideos([videoId]);
      };
      videoQueue.addListener(listener);
      const video = videoQueue.addVideo(payload);
      videoId = video.id;
      signal.addEventListener('abort', onAbort, { once: true });
      // The queue starts paused in the UI until a video is generated, like `csdm video` it's resumed here.
      videoQueue.resume();
    });
  }

  private getFirstKillOffset(job: KrispShotClipJob, parts: ClipPart[]) {
    const tickrate = job.tickrate || 64;
    const [firstKill] = [...job.kills].sort((a, b) => a.tick - b.tick);
    let offset = 0;
    for (const [index, segment] of job.segments.entries()) {
      if (firstKill && firstKill.tick >= segment.startTick && firstKill.tick <= segment.endTick) {
        return offset + (firstKill.tick - segment.startTick) / tickrate;
      }
      offset += parts[index]?.duration ?? (segment.endTick - segment.startTick) / tickrate;
    }

    return 1;
  }

  private describeError(error: unknown) {
    if (error instanceof JobError || error instanceof SiteApiError) {
      return error.message;
    }
    const errorCode = getErrorCodeFromError(error);
    if (errorCode !== ErrorCode.UnknownError) {
      return getErrorCodeMessage(errorCode);
    }

    return error instanceof Error ? error.message : String(error);
  }

  /* ───────────────────────────── status ───────────────────────────── */

  private log(message: string) {
    const time = new Date().toLocaleTimeString();
    this.status.log = [...this.status.log, `[${time}] ${message}`].slice(-LOG_SIZE);
    logger.log(`[krispshot] ${message}`);
    this.pushStatus();
  }

  private setState(state: KrispShotWorkerState, message: string) {
    if (this.status.state === state && this.status.message === message) {
      return;
    }
    this.status.state = state;
    this.status.message = message;
    this.pushStatus();
  }

  private pushStatus() {
    if (this.pushTimeout) {
      return;
    }
    this.pushTimeout = setTimeout(() => {
      this.pushTimeout = null;
      server.sendPushMessage({
        name: ServerPushMessageName.KrispShotStatusChanged,
        payload: this.getState(),
      });
    }, 300);
  }
}

export const krispShotWorker = new KrispShotWorker();
