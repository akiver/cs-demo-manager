import { randomUUID } from 'node:crypto';
import { Command } from './command';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import { getOutputFolderPath } from 'csdm/node/video/get-output-folder-path';
import { generateVideo } from 'csdm/node/video/generation/generate-video';
import type { Sequence } from 'csdm/common/types/sequence';
import yargsParser from 'yargs-parser';
import type { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { RecordingSystem } from 'csdm/common/types/recording-system';
import type { RecordingOutput } from 'csdm/common/types/recording-output';
import type { VideoContainer } from 'csdm/common/types/video-container';

export class VideoCommand extends Command {
  public static Name = 'video';
  private demoPath: string;
  private startTick: number;
  private endTick: number;
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
    this.parseArgs();
    await migrateSettings();
    await this.initDatabaseConnection();

    const settings = await getSettings();
    const demo = await getDemoFromFilePath(this.demoPath);
    const outputFolderPath = await getOutputFolderPath(settings.video, this.demoPath);

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

    try {
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
      } else {
        console.error(error);
      }
      this.exitWithFailure();
    }
  }

  protected parseArgs() {
    super.parseArgs(this.args);
    const parsedArgs = yargsParser(this.args);

    if (parsedArgs._.length < 3) {
      console.log('Missing arguments');
      this.printHelp();
      this.exitWithFailure();
    }

    this.demoPath = String(parsedArgs._[0]);
    this.startTick = Number(parsedArgs._[1]);
    this.endTick = Number(parsedArgs._[2]);

    const isValidTicks = !Number.isNaN(this.startTick) && !Number.isNaN(this.endTick) && this.endTick > this.startTick;
    const isDemo = this.demoPath.endsWith('.dem');

    if (!isDemo || !isValidTicks) {
      console.log('Invalid arguments');
      this.exitWithFailure();
    }

    this.framerate = parsedArgs.framerate;
    this.width = parsedArgs.width;
    this.height = parsedArgs.height;
    this.closeGameAfterRecording = parsedArgs.closeGameAfterRecording;
    this.concatenateSequences = parsedArgs.concatenateSequences;
    this.encoderSoftware = parsedArgs.encoderSoftware;
    this.recordingSystem = parsedArgs.recordingSystem;
    this.recordingOutput = parsedArgs.recordingOutput;
    this.ffmpegCrf = parsedArgs.ffmpegCrf;
    this.ffmpegAudioBitrate = parsedArgs.ffmpegAudioBitrate;
    this.ffmpegVideoCodec = parsedArgs.ffmpegVideoCodec;
    this.ffmpegAudioCodec = parsedArgs.ffmpegAudioCodec;
    this.ffmpegVideoContainer = parsedArgs.ffmpegVideoContainer;
    this.ffmpegInputParameters = parsedArgs.ffmpegInputParameters;
    this.ffmpegOutputParameters = parsedArgs.ffmpegOutputParameters;
    this.showXRay = parsedArgs.showXRay;
    this.showOnlyDeathNotices = parsedArgs.showOnlyDeathNotices;
    this.playerVoices = parsedArgs.playerVoices;
    this.deathNoticesDuration = parsedArgs.deathNoticesDuration;
    this.cfg = parsedArgs.cfg;
  }
}
