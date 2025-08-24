import { randomUUID } from 'node:crypto';
import { Command } from './command';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import { getOutputFolderPath } from 'csdm/node/video/get-output-folder-path';
import { generateVideo } from 'csdm/node/video/generation/generate-video';
import type { Sequence } from 'csdm/common/types/sequence';
import type { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { EncoderSoftware as EncoderSoftwareEnum } from 'csdm/common/types/encoder-software';
import type { RecordingSystem } from 'csdm/common/types/recording-system';
import { RecordingSystem as RecordingSystemEnum } from 'csdm/common/types/recording-system';
import type { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingOutput as RecordingOutputEnum } from 'csdm/common/types/recording-output';
import { VideoContainer } from 'csdm/common/types/video-container';
import { parseArgs } from 'node:util';
import { InvalidArgument } from 'csdm/node/errors/invalid-argument';

export class VideoCommand extends Command {
  public static Name = 'video';
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
  private showOnlyDeathNotices: boolean | undefined;
  private playerVoices: boolean | undefined;
  private deathNoticesDuration: number | undefined;
  private cfg: string | undefined;

  public getDescription() {
    return 'Generate a video from a demo.';
  }

  public printHelp() {
    console.log(this.getDescription());
    console.log('');
    console.log(`Usage: csdm ${VideoCommand.Name} <demoPath> <startTick> <endTick> [options]`);
    console.log('');
    console.log('The demo must already be analyzed and present in the database.');
    console.log('');
    console.log('Options:');
    console.log('  --framerate <number>');
    console.log('  --width <number>');
    console.log('  --height <number>');
    console.log('  --close-game-after-recording <boolean>');
    console.log('  --concatenate-sequences <boolean>');
    console.log('  --encoder-software <string> (ffmpeg or vdub)');
    console.log('  --recording-system <string> (hlae or cs)');
    console.log('  --recording-output <string> (video, images or both)');
    console.log('  --ffmpeg-crf <number>');
    console.log('  --ffmpeg-audio-bitrate <number>');
    console.log('  --ffmpeg-video-codec <string>');
    console.log('  --ffmpeg-audio-codec <string>');
    console.log('  --ffmpeg-video-container <string> (mp4, avi, etc.)');
    console.log('  --ffmpeg-input-parameters <string>');
    console.log('  --ffmpeg-output-parameters <string>');
    console.log('  --show-x-ray <boolean>');
    console.log('  --show-only-death-notices <boolean>');
    console.log('  --player-voices <boolean>');
    console.log('  --death-notices-duration <number>');
    console.log('  --cfg <string>');
  }

  public async run() {
    try {
      this.parseArgs();
      await migrateSettings();

      const settings = await getSettings();
      const demo = await getDemoFromFilePath(this.demoPath);
      let outputFolderPath = await getOutputFolderPath(settings.video, this.demoPath);
      outputFolderPath = `${outputFolderPath}/${demo.name}`;

      const sequence: Sequence = {
        number: 1,
        startTick: this.startTick,
        endTick: this.endTick,
        showXRay: this.showXRay ?? settings.video.showXRay,
        showOnlyDeathNotices: this.showOnlyDeathNotices ?? settings.video.showOnlyDeathNotices,
        playersOptions: [],
        cameras: [],
        playerVoicesEnabled: this.playerVoices ?? settings.video.playerVoicesEnabled,
        deathNoticesDuration: this.deathNoticesDuration ?? settings.video.deathNoticesDuration,
        cfg: this.cfg,
      };

      const videoId = randomUUID();
      const controller = new AbortController();

      await generateVideo({
        videoId,
        checksum: demo.checksum,
        game: demo.game,
        tickrate: demo.tickrate,
        recordingSystem: this.recordingSystem ?? settings.video.recordingSystem,
        recordingOutput: this.recordingOutput ?? settings.video.recordingOutput,
        encoderSoftware: this.encoderSoftware ?? settings.video.encoderSoftware,
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

  protected parseArgs() {
    super.parseArgs(this.args);
    const { values, positionals } = parseArgs({
      options: {
        framerate: { type: 'string' },
        width: { type: 'string' },
        height: { type: 'string' },
        'close-game-after-recording': { type: 'boolean' },
        'concatenate-sequences': { type: 'boolean' },
        'encoder-software': { type: 'string' },
        'recording-system': { type: 'string' },
        'recording-output': { type: 'string' },
        'ffmpeg-crf': { type: 'string' },
        'ffmpeg-audio-bitrate': { type: 'string' },
        'ffmpeg-video-codec': { type: 'string' },
        'ffmpeg-audio-codec': { type: 'string' },
        'ffmpeg-video-container': { type: 'string' },
        'ffmpeg-input-parameters': { type: 'string' },
        'ffmpeg-output-parameters': { type: 'string' },
        'show-x-ray': { type: 'boolean' },
        'show-only-death-notices': { type: 'boolean' },
        'player-voices': { type: 'boolean' },
        'death-notices-duration': { type: 'string' },
        cfg: { type: 'string' },
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
    this.startTick = startTick;

    const endTick = Number(positionals[2]);
    if (Number.isNaN(endTick)) {
      throw new InvalidArgument('End tick is not a number');
    }
    if (endTick <= startTick) {
      throw new InvalidArgument('End tick must be greater than start tick');
    }
    this.endTick = endTick;

    if (values.framerate !== undefined) {
      const framerate = Number(values.framerate);
      if (Number.isNaN(framerate)) {
        throw new InvalidArgument('Framerate is not a number');
      }
      this.framerate = framerate;
    }
    if (values.width !== undefined) {
      const width = Number(values.width);
      if (Number.isNaN(width)) {
        throw new InvalidArgument('Width is not a number');
      }
      this.width = width;
    }
    if (values.height !== undefined) {
      const height = Number(values.height);
      if (Number.isNaN(height)) {
        throw new InvalidArgument('Height is not a number');
      }
      this.height = height;
    }
    if (values['close-game-after-recording'] !== undefined) {
      this.closeGameAfterRecording = Boolean(values['close-game-after-recording']);
    }
    if (values['concatenate-sequences'] !== undefined) {
      this.concatenateSequences = Boolean(values['concatenate-sequences']);
    }
    if (values['encoder-software'] !== undefined) {
      const encoderSoftware = values['encoder-software'] as EncoderSoftware;
      if (!Object.values(EncoderSoftwareEnum).includes(encoderSoftware)) {
        throw new InvalidArgument('Invalid encoder software');
      }
      this.encoderSoftware = encoderSoftware;
    }
    if (values['recording-system'] !== undefined) {
      const recordingSystem = (values['recording-system'] as string).toUpperCase() as RecordingSystem;
      if (!Object.values(RecordingSystemEnum).includes(recordingSystem)) {
        throw new InvalidArgument('Invalid recording system');
      }
      this.recordingSystem = recordingSystem;
    }
    if (values['recording-output'] !== undefined) {
      const recordingOutput = values['recording-output'] as RecordingOutput;
      if (!Object.values(RecordingOutputEnum).includes(recordingOutput)) {
        throw new InvalidArgument('Invalid recording output');
      }
      this.recordingOutput = recordingOutput;
    }
    if (values['ffmpeg-crf'] !== undefined) {
      const ffmpegCrf = Number(values['ffmpeg-crf']);
      if (Number.isNaN(ffmpegCrf)) {
        throw new InvalidArgument('FFMPEG CRF is not a number');
      }
      this.ffmpegCrf = ffmpegCrf;
    }
    if (values['ffmpeg-audio-bitrate'] !== undefined) {
      const ffmpegAudioBitrate = Number(values['ffmpeg-audio-bitrate']);
      if (Number.isNaN(ffmpegAudioBitrate)) {
        throw new InvalidArgument('FFMPEG audio bitrate is not a number');
      }
      this.ffmpegAudioBitrate = ffmpegAudioBitrate;
    }
    if (values['ffmpeg-video-codec'] !== undefined) {
      this.ffmpegVideoCodec = String(values['ffmpeg-video-codec']);
    }
    if (values['ffmpeg-audio-codec'] !== undefined) {
      this.ffmpegAudioCodec = String(values['ffmpeg-audio-codec']);
    }
    if (values['ffmpeg-video-container'] !== undefined) {
      const videoContainer = values['ffmpeg-video-container'] as VideoContainer;
      if (!Object.values(VideoContainer).includes(videoContainer)) {
        throw new InvalidArgument('Invalid video container');
      }
      this.ffmpegVideoContainer = videoContainer;
    }
    if (values['ffmpeg-input-parameters'] !== undefined) {
      this.ffmpegInputParameters = String(values['ffmpeg-input-parameters']);
    }
    if (values['ffmpeg-output-parameters'] !== undefined) {
      this.ffmpegOutputParameters = String(values['ffmpeg-output-parameters']);
    }
    if (values['show-x-ray'] !== undefined) {
      this.showXRay = Boolean(values['show-x-ray']);
    }
    if (values['show-only-death-notices'] !== undefined) {
      this.showOnlyDeathNotices = Boolean(values['show-only-death-notices']);
    }
    if (values['player-voices'] !== undefined) {
      this.playerVoices = Boolean(values['player-voices']);
    }
    if (values['death-notices-duration'] !== undefined) {
      const deathNoticesDuration = Number(values['death-notices-duration']);
      if (Number.isNaN(deathNoticesDuration)) {
        throw new InvalidArgument('Death notices duration is not a number');
      }
      this.deathNoticesDuration = deathNoticesDuration;
    }
    if (values.cfg !== undefined) {
      this.cfg = String(values.cfg);
    }
  }
}
