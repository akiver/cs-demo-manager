import { randomUUID } from 'node:crypto';
import { Command } from './command';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import { getOutputFolderPath } from 'csdm/node/video/get-output-folder-path';
import { generateVideo } from 'csdm/node/video/generation/generate-video';
import type { Sequence } from 'csdm/common/types/sequence';

export class VideoCommand extends Command {
  public static Name = 'video';
  private demoPath = '';
  private startTick = 0;
  private endTick = 0;

  public getDescription() {
    return 'Generate a video from a demo.';
  }

  public printHelp() {
    console.log(this.getDescription());
    console.log('');
    console.log(`Usage: csdm ${VideoCommand.Name} <demoPath> <startTick> <endTick>`);
    console.log('');
    console.log('The demo must already be analyzed and present in the database.');
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
      showXRay: settings.video.showXRay,
      showOnlyDeathNotices: settings.video.showOnlyDeathNotices,
      playersOptions: [],
      cameras: [],
      playerVoicesEnabled: settings.video.playerVoicesEnabled,
      deathNoticesDuration: settings.video.deathNoticesDuration,
    };

    const videoId = randomUUID();
    const controller = new AbortController();

    try {
      await generateVideo({
        videoId,
        checksum: demo.checksum,
        game: demo.game,
        tickrate: demo.tickrate,
        recordingSystem: settings.video.recordingSystem,
        recordingOutput: settings.video.recordingOutput,
        encoderSoftware: settings.video.encoderSoftware,
        framerate: settings.video.framerate,
        width: settings.video.width,
        height: settings.video.height,
        closeGameAfterRecording: settings.video.closeGameAfterRecording,
        concatenateSequences: settings.video.concatenateSequences,
        ffmpegSettings: settings.video.ffmpegSettings,
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
    if (this.args.length < 3) {
      console.log('Missing arguments');
      this.printHelp();
      this.exitWithFailure();
    }

    this.demoPath = this.args[0];
    this.startTick = Number(this.args[1]);
    this.endTick = Number(this.args[2]);

    const isValidTicks = !Number.isNaN(this.startTick) && !Number.isNaN(this.endTick) && this.endTick > this.startTick;
    const isDemo = this.demoPath.endsWith('.dem');

    if (!isDemo || !isValidTicks) {
      console.log('Invalid arguments');
      this.exitWithFailure();
    }
  }
}
