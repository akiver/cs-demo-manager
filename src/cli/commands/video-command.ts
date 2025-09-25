import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import path from 'node:path';
import fs from 'fs-extra';
import { Command } from './command';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import { generateVideo } from 'csdm/node/video/generation/generate-video';
import type { Sequence } from 'csdm/common/types/sequence';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { isValidEncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { isValidRecordingSystem } from 'csdm/common/types/recording-system';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { isValidRecordingOutput } from 'csdm/common/types/recording-output';
import type { VideoContainer } from 'csdm/common/types/video-container';
import { isValidVideoContainer } from 'csdm/common/types/video-container';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { isHlaeInstalled } from 'csdm/node/video/hlae/is-hlae-installed';
import { installHlae } from 'csdm/node/video/hlae/install-hlae';
import { isVirtualDubInstalled } from 'csdm/node/video/virtual-dub/is-virtual-dub-installed';
import { downloadAndExtractVirtualDub } from 'csdm/node/video/virtual-dub/download-and-extract-virtual-dub';
import { isFfmpegInstalled } from 'csdm/node/video/ffmpeg/is-ffmpeg-installed';
import { installFfmpeg } from 'csdm/node/video/ffmpeg/install-ffmpeg';
import { fetchPlayer } from 'csdm/node/database/player/fetch-player';

export class VideoCommand extends Command {
  public static Name = 'video';
  private readonly outputFlag = 'output';
  private readonly framerateFlag = 'framerate';
  private readonly widthFlag = 'width';
  private readonly heightFlag = 'height';
  private readonly closeGameAfterRecordingFlag = 'close-game-after-recording';
  private readonly noCloseGameAfterRecordingFlag = 'no-close-game-after-recording';
  private readonly concatenateSequencesFlag = 'concatenate-sequences';
  private readonly noConcatenateSequencesFlag = 'no-concatenate-sequences';
  private readonly encoderSoftwareFlag = 'encoder-software';
  private readonly recordingSystemFlag = 'recording-system';
  private readonly recordingOutputFlag = 'recording-output';
  private readonly ffmpegCrfFlag = 'ffmpeg-crf';
  private readonly ffmpegAudioBitrateFlag = 'ffmpeg-audio-bitrate';
  private readonly ffmpegVideoCodecFlag = 'ffmpeg-video-codec';
  private readonly ffmpegAudioCodecFlag = 'ffmpeg-audio-codec';
  private readonly ffmpegVideoContainerFlag = 'ffmpeg-video-container';
  private readonly ffmpegInputParametersFlag = 'ffmpeg-input-parameters';
  private readonly ffmpegOutputParametersFlag = 'ffmpeg-output-parameters';
  private readonly showXRayFlag = 'show-x-ray';
  private readonly noShowXRayFlag = 'no-show-x-ray';
  private readonly showAssistsFlag = 'show-assists';
  private readonly noShowAssistsFlag = 'no-show-assists';
  private readonly showOnlyDeathNoticesFlag = 'show-only-death-notices';
  private readonly noShowOnlyDeathNoticesFlag = 'no-show-only-death-notices';
  private readonly playerVoicesFlag = 'player-voices';
  private readonly noPlayerVoicesFlag = 'no-player-voices';
  private readonly deathNoticesDurationFlag = 'death-notices-duration';
  private readonly cfgFlag = 'cfg';
  private readonly focusPlayerFlag = 'focus-player';
  private outputFolderPath: string | undefined;
  private demoPath: string = '';
  private startTick: number = 0;
  private endTick: number = 0;
  private framerate: number | undefined;
  private width: number | undefined;
  private height: number | undefined;
  private closeGameAfterRecording: boolean | undefined;
  private concatenateSequences: boolean | undefined;
  private encoderSoftware: EncoderSoftware | undefined;
  private recordingSystem: RecordingSystem | undefined;
  private recordingOutput: RecordingOutput | undefined;
  private ffmpegCrf: number | undefined;
  private ffmpegAudioBitrate: number | undefined;
  private ffmpegVideoCodec: string | undefined;
  private ffmpegAudioCodec: string | undefined;
  private ffmpegVideoContainer: VideoContainer | undefined;
  private ffmpegInputParameters: string | undefined;
  private ffmpegOutputParameters: string | undefined;
  private showXRay: boolean | undefined;
  private showAssists: boolean | undefined;
  private showOnlyDeathNotices: boolean | undefined;
  private playerVoices: boolean | undefined;
  private deathNoticesDuration: number | undefined;
  private cfg: string | undefined;
  private focusPlayerSteamId: string | undefined;

  public getDescription() {
    return 'Generate videos from demos.';
  }

  public printHelp() {
    console.log(this.getDescription());
    console.log('');
    console.log(`Usage: csdm ${VideoCommand.Name} <demoPath> <startTick> <endTick> [options]`);
    console.log('');
    console.log('The demo must have been analyzed and be present in the database.');
    console.log('');
    console.log('Options:');
    console.log(`  --${this.framerateFlag} <number>`);
    console.log(`  --${this.widthFlag} <number>`);
    console.log(`  --${this.heightFlag} <number>`);
    console.log(`  --${this.closeGameAfterRecordingFlag}`);
    console.log(`  --${this.noCloseGameAfterRecordingFlag}`);
    console.log(`  --${this.concatenateSequencesFlag}`);
    console.log(`  --${this.noConcatenateSequencesFlag}`);
    console.log(`  --${this.encoderSoftwareFlag} <string> (FFmpeg or VirtualDub)`);
    console.log(`  --${this.recordingSystemFlag} <string> (HLAE or CS)`);
    console.log(`  --${this.recordingOutputFlag} <string> (video, images, or images-and-video)`);
    console.log(`  --${this.ffmpegCrfFlag} <number>`);
    console.log(`  --${this.ffmpegAudioBitrateFlag} <number>`);
    console.log(`  --${this.ffmpegVideoCodecFlag} <string>`);
    console.log(`  --${this.ffmpegAudioCodecFlag} <string>`);
    console.log(`  --${this.ffmpegVideoContainerFlag} <string> (mp4, avi or mkv)`);
    console.log(`  --${this.ffmpegInputParametersFlag} <string>`);
    console.log(`  --${this.ffmpegOutputParametersFlag} <string>`);
    console.log(`  --${this.showXRayFlag}`);
    console.log(`  --${this.noShowXRayFlag}`);
    console.log(`  --${this.showAssistsFlag}`);
    console.log(`  --${this.noShowAssistsFlag}`);
    console.log(`  --${this.showOnlyDeathNoticesFlag}`);
    console.log(`  --${this.noShowOnlyDeathNoticesFlag}`);
    console.log(`  --${this.playerVoicesFlag}`);
    console.log(`  --${this.noPlayerVoicesFlag}`);
    console.log(`  --${this.deathNoticesDurationFlag} <number>`);
    console.log(`  --${this.cfgFlag} <string>`);
    console.log(`  --${this.focusPlayerFlag} <steamId>`);
  }

  public async run() {
    try {
      await this.parseArgs();
      await this.initDatabaseConnection();
      await migrateSettings();

      const settings = await getSettings();
      const demo = await getDemoFromFilePath(this.demoPath);
      const outputFolderPath = this.outputFolderPath ?? path.dirname(this.demoPath);
      const sequence: Sequence = {
        number: 1,
        startTick: this.startTick,
        endTick: this.endTick,
        showXRay: this.showXRay ?? settings.video.showXRay,
        showAssists: this.showAssists ?? settings.video.showAssists,
        showOnlyDeathNotices: this.showOnlyDeathNotices ?? settings.video.showOnlyDeathNotices,
        playersOptions: [],
        cameras: [],
        playerVoicesEnabled: this.playerVoices ?? settings.video.playerVoicesEnabled,
        deathNoticesDuration: this.deathNoticesDuration ?? settings.video.deathNoticesDuration,
        cfg: this.cfg,
      };

      if (this.focusPlayerSteamId) {
        const player = await fetchPlayer(this.focusPlayerSteamId);
        sequence.cameras.push({
          tick: this.startTick,
          playerSteamId: this.focusPlayerSteamId,
          playerName: player.name,
        });
      }

      const recordingSystem = this.recordingSystem ?? settings.video.recordingSystem;
      if (recordingSystem === RecordingSystem.HLAE && !(await isHlaeInstalled())) {
        console.log('Installing HLAE...');
        await installHlae();
      }

      const recordingOutput = this.recordingOutput ?? settings.video.recordingOutput;
      const shouldGenerateVideo = recordingOutput !== RecordingOutput.Images;
      const encoderSoftware = this.encoderSoftware ?? settings.video.encoderSoftware;
      if (shouldGenerateVideo && encoderSoftware === EncoderSoftware.VirtualDub && !(await isVirtualDubInstalled())) {
        console.log('Installing VirtualDub...');
        await downloadAndExtractVirtualDub();
      }

      if (shouldGenerateVideo && encoderSoftware === EncoderSoftware.FFmpeg && !(await isFfmpegInstalled())) {
        console.log('Installing FFmpeg...');
        await installFfmpeg();
      }

      const videoId = randomUUID();
      const controller = new AbortController();

      await generateVideo({
        videoId,
        checksum: demo.checksum,
        game: demo.game,
        tickrate: demo.tickrate,
        recordingSystem,
        recordingOutput,
        encoderSoftware,
        framerate: this.framerate ?? settings.video.framerate,
        width: this.width ?? settings.video.width,
        height: this.height ?? settings.video.height,
        closeGameAfterRecording: this.closeGameAfterRecording ?? settings.video.closeGameAfterRecording,
        concatenateSequences: this.concatenateSequences ?? settings.video.concatenateSequences,
        ffmpegSettings: {
          ...settings.video.ffmpegSettings,
          audioBitrate: this.ffmpegAudioBitrate ?? settings.video.ffmpegSettings.audioBitrate,
          constantRateFactor: this.ffmpegCrf ?? settings.video.ffmpegSettings.constantRateFactor,
          videoCodec: this.ffmpegVideoCodec ?? settings.video.ffmpegSettings.videoCodec,
          audioCodec: this.ffmpegAudioCodec ?? settings.video.ffmpegSettings.audioCodec,
          videoContainer: this.ffmpegVideoContainer ?? settings.video.ffmpegSettings.videoContainer,
          inputParameters: this.ffmpegInputParameters ?? settings.video.ffmpegSettings.inputParameters,
          outputParameters: this.ffmpegOutputParameters ?? settings.video.ffmpegSettings.outputParameters,
        },
        outputFolderPath,
        demoPath: this.demoPath,
        sequences: [sequence],
        signal: controller.signal,
        onGameStart: () => {
          console.log('Counter-Strike started');
        },
        onMoveFilesStart: () => {
          console.log('Moving files...');
        },
        onSequenceStart: (number) => {
          console.log(`Converting sequence ${number}...`);
        },
        onConcatenateSequencesStart: () => {
          console.log('Concatenating sequences...');
        },
      });

      console.log(`Video generated in ${outputFolderPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        if (error instanceof InvalidArgument) {
          this.printHelp();
        }
      } else {
        console.error(error);
      }
      this.exitWithFailure();
    }
  }

  protected async parseArgs() {
    super.parseArgs(this.args);
    const { values, positionals } = parseArgs({
      options: {
        [this.outputFlag]: { type: 'string', short: 'o' },
        [this.framerateFlag]: { type: 'string' },
        [this.widthFlag]: { type: 'string' },
        [this.heightFlag]: { type: 'string' },
        [this.closeGameAfterRecordingFlag]: { type: 'boolean' },
        [this.noCloseGameAfterRecordingFlag]: { type: 'boolean' },
        [this.concatenateSequencesFlag]: { type: 'boolean' },
        [this.noConcatenateSequencesFlag]: { type: 'boolean' },
        [this.encoderSoftwareFlag]: { type: 'string' },
        [this.recordingSystemFlag]: { type: 'string' },
        [this.recordingOutputFlag]: { type: 'string' },
        [this.ffmpegCrfFlag]: { type: 'string' },
        [this.ffmpegAudioBitrateFlag]: { type: 'string' },
        [this.ffmpegVideoCodecFlag]: { type: 'string' },
        [this.ffmpegAudioCodecFlag]: { type: 'string' },
        [this.ffmpegVideoContainerFlag]: { type: 'string' },
        [this.ffmpegInputParametersFlag]: { type: 'string' },
        [this.ffmpegOutputParametersFlag]: { type: 'string' },
        [this.showXRayFlag]: { type: 'boolean' },
        [this.noShowXRayFlag]: { type: 'boolean' },
        [this.showAssistsFlag]: { type: 'boolean' },
        [this.noShowAssistsFlag]: { type: 'boolean' },
        [this.showOnlyDeathNoticesFlag]: { type: 'boolean' },
        [this.noShowOnlyDeathNoticesFlag]: { type: 'boolean' },
        [this.playerVoicesFlag]: { type: 'boolean' },
        [this.noPlayerVoicesFlag]: { type: 'boolean' },
        [this.deathNoticesDurationFlag]: { type: 'string' },
        [this.cfgFlag]: { type: 'string' },
        [this.focusPlayerFlag]: { type: 'string' },
      },
      allowPositionals: true,
      args: this.args,
    });

    if (positionals.length < 3) {
      throw new InvalidArgument('Missing arguments');
    }

    const demoPath = positionals[0];
    if (typeof demoPath !== 'string' || !demoPath.endsWith('.dem')) {
      throw new InvalidArgument('Invalid demo path');
    }
    this.demoPath = demoPath;

    const startTick = Number(positionals[1]);
    if (Number.isNaN(startTick)) {
      throw new InvalidArgument('Start tick is not a number');
    }
    if (startTick < 0) {
      throw new InvalidArgument('Start tick must be a positive number');
    }
    this.startTick = startTick;

    const endTick = Number(positionals[2]);
    if (Number.isNaN(endTick)) {
      throw new InvalidArgument('End tick is not a number');
    }
    if (endTick < 0) {
      throw new InvalidArgument('End tick must be a positive number');
    }
    if (endTick <= startTick) {
      throw new InvalidArgument('End tick must be greater than start tick');
    }
    this.endTick = endTick;

    const outputFolderPath = values[this.outputFlag];
    if (outputFolderPath) {
      try {
        const stats = await fs.stat(outputFolderPath);
        if (!stats.isDirectory()) {
          throw new InvalidArgument('Output folder is not a directory');
        }
        this.outputFolderPath = outputFolderPath;
      } catch (error) {
        if (error instanceof InvalidArgument) {
          throw error;
        }
        throw new InvalidArgument('Output folder does not exist');
      }
    }
    if (values[this.framerateFlag]) {
      const framerate = Number(values[this.framerateFlag]);
      if (Number.isNaN(framerate)) {
        throw new InvalidArgument('Framerate is not a number');
      }
      if (framerate < 0) {
        throw new InvalidArgument('Framerate must be a positive number');
      }
      this.framerate = framerate;
    }
    if (values[this.widthFlag]) {
      const width = Number(values[this.widthFlag]);
      if (Number.isNaN(width)) {
        throw new InvalidArgument('Width is not a number');
      }
      if (width < 800) {
        throw new InvalidArgument('Width must be at least 800');
      }
      this.width = width;
    }
    if (values[this.heightFlag]) {
      const height = Number(values[this.heightFlag]);
      if (Number.isNaN(height)) {
        throw new InvalidArgument('Height is not a number');
      }
      if (height < 600) {
        throw new InvalidArgument('Height must be at least 600');
      }
      this.height = height;
    }
    const closeGameAfterRecording = values[this.closeGameAfterRecordingFlag];
    if (closeGameAfterRecording !== undefined) {
      this.closeGameAfterRecording = true;
    }
    const noCloseGameAfterRecording = values[this.noCloseGameAfterRecordingFlag];
    if (noCloseGameAfterRecording !== undefined) {
      this.closeGameAfterRecording = false;
    }
    const concatenateSequences = values[this.concatenateSequencesFlag];
    if (concatenateSequences !== undefined) {
      this.concatenateSequences = true;
    }
    const noConcatenateSequences = values[this.noConcatenateSequencesFlag];
    if (noConcatenateSequences !== undefined) {
      this.concatenateSequences = false;
    }
    const encoderSoftware = values[this.encoderSoftwareFlag];
    if (encoderSoftware !== undefined) {
      if (!isValidEncoderSoftware(encoderSoftware)) {
        throw new InvalidArgument('Invalid encoder software');
      }
      this.encoderSoftware = encoderSoftware;
    }
    const recordingSystem = values[this.recordingSystemFlag];
    if (recordingSystem !== undefined) {
      if (!isValidRecordingSystem(recordingSystem)) {
        throw new InvalidArgument('Invalid recording system');
      }
      this.recordingSystem = recordingSystem;
    }
    const recordingOutput = values[this.recordingOutputFlag];
    if (recordingOutput !== undefined) {
      if (!isValidRecordingOutput(recordingOutput)) {
        throw new InvalidArgument('Invalid recording output');
      }
      this.recordingOutput = recordingOutput;
    }
    if (values[this.ffmpegCrfFlag] !== undefined) {
      const ffmpegCrf = Number(values[this.ffmpegCrfFlag]);
      if (Number.isNaN(ffmpegCrf)) {
        throw new InvalidArgument('FFmpeg CRF is not a number');
      }
      if (ffmpegCrf < 0 || ffmpegCrf > 51) {
        throw new InvalidArgument('FFmpeg CRF must be between 0 and 51');
      }
      this.ffmpegCrf = ffmpegCrf;
    }
    if (values[this.ffmpegAudioBitrateFlag] !== undefined) {
      const ffmpegAudioBitrate = Number(values[this.ffmpegAudioBitrateFlag]);
      if (Number.isNaN(ffmpegAudioBitrate)) {
        throw new InvalidArgument('FFmpeg audio bitrate is not a number');
      }
      if (ffmpegAudioBitrate < 8) {
        throw new InvalidArgument('FFmpeg audio bitrate must be at least 8');
      }
      this.ffmpegAudioBitrate = ffmpegAudioBitrate;
    }
    if (values[this.ffmpegVideoCodecFlag] !== undefined) {
      this.ffmpegVideoCodec = values[this.ffmpegVideoCodecFlag];
    }
    if (values[this.ffmpegAudioCodecFlag]) {
      this.ffmpegAudioCodec = values[this.ffmpegAudioCodecFlag];
    }
    const videoContainer = values[this.ffmpegVideoContainerFlag];
    if (videoContainer !== undefined) {
      if (!isValidVideoContainer(videoContainer)) {
        throw new InvalidArgument('Invalid video container');
      }
      this.ffmpegVideoContainer = videoContainer;
    }
    if (values[this.ffmpegInputParametersFlag] !== undefined) {
      this.ffmpegInputParameters = values[this.ffmpegInputParametersFlag];
    }
    if (values[this.ffmpegOutputParametersFlag]) {
      this.ffmpegOutputParameters = values[this.ffmpegOutputParametersFlag];
    }
    const showXRay = values[this.showXRayFlag];
    if (showXRay !== undefined) {
      this.showXRay = true;
    }
    const noShowXRay = values[this.noShowXRayFlag];
    if (noShowXRay !== undefined) {
      this.showXRay = false;
    }
    const showAssists = values[this.showAssistsFlag];
    if (showAssists !== undefined) {
      this.showAssists = true;
    }
    const noShowAssists = values[this.noShowAssistsFlag];
    if (noShowAssists !== undefined) {
      this.showAssists = false;
    }
    const showOnlyDeathNotices = values[this.showOnlyDeathNoticesFlag];
    if (showOnlyDeathNotices !== undefined) {
      this.showOnlyDeathNotices = true;
    }
    const noShowOnlyDeathNotices = values[this.noShowOnlyDeathNoticesFlag];
    if (noShowOnlyDeathNotices !== undefined) {
      this.showOnlyDeathNotices = false;
    }
    const playerVoices = values[this.playerVoicesFlag];
    if (playerVoices !== undefined) {
      this.playerVoices = true;
    }
    const noPlayerVoices = values[this.noPlayerVoicesFlag];
    if (noPlayerVoices !== undefined) {
      this.playerVoices = false;
    }
    if (values[this.deathNoticesDurationFlag]) {
      const deathNoticesDuration = Number(values[this.deathNoticesDurationFlag]);
      if (Number.isNaN(deathNoticesDuration)) {
        throw new InvalidArgument('Death notices duration is not a number');
      }
      if (deathNoticesDuration < 0) {
        throw new InvalidArgument('Death notices duration must be at least 0');
      }
      this.deathNoticesDuration = deathNoticesDuration;
    }
    if (values[this.cfgFlag]) {
      this.cfg = values[this.cfgFlag];
    }
    if (values[this.focusPlayerFlag]) {
      this.focusPlayerSteamId = values[this.focusPlayerFlag] as string;
    }
  }
}
