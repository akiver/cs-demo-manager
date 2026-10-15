import path from 'node:path';
import fs from 'fs-extra';
import { Command } from './command';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import type { AddVideoPayload, Video } from 'csdm/common/types/video';
import { VideoStatus } from 'csdm/common/types/video-status';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { isValidEncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { isValidRecordingSystem } from 'csdm/common/types/recording-system';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { isValidRecordingOutput } from 'csdm/common/types/recording-output';
import { VideoContainer } from 'csdm/common/types/video-container';
import { isValidVideoContainer } from 'csdm/common/types/video-container';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { CommandError } from 'csdm/cli/errors/command-error';
import { isHlaeInstalled } from 'csdm/node/video/hlae/is-hlae-installed';
import { isVirtualDubInstalled } from 'csdm/node/video/virtual-dub/is-virtual-dub-installed';
import { isFfmpegInstalled } from 'csdm/node/video/ffmpeg/is-ffmpeg-installed';
import { fetchPlayer } from 'csdm/node/database/player/fetch-player';
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { CliWebSocketClient } from 'csdm/cli/web-socket/cli-web-socket-client';
import type { FfmpegSettings } from 'csdm/node/settings/settings';
import type { Sequence } from 'csdm/common/types/sequence';
import { fetchMatchesByChecksums } from 'csdm/node/database/matches/fetch-matches-by-checksums';
import { isValidPlayerSequenceEvent, PlayerSequenceEvent } from 'csdm/common/types/player-sequence-event';
import type { PlayerSequenceEvent as PlayerSequenceEventType } from 'csdm/common/types/player-sequence-event';
import { isValidPerspective, Perspective } from 'csdm/common/types/perspective';
import { Perspective as PerspectiveType } from 'csdm/common/types/perspective';
import { buildPlayersEventSequences } from 'csdm/common/video/sequences/build-players-event-sequences';
import { buildPlayersRoundsSequences } from 'csdm/common/video/sequences/build-players-rounds-sequences';
import { getErrorCodeMessage } from 'csdm/cli/get-error-code-message';
import { output, type TableCell } from 'csdm/cli/output';
import { formatDate, formatDuration } from 'csdm/cli/format';
import type { CommandOptions } from 'csdm/cli/parse-command-args';

export type VideoCommandConfig = {
  demoPath: string;
  recordingSystem?: RecordingSystem;
  recordingOutput?: RecordingOutput;
  encoderSoftware?: EncoderSoftware;
  framerate?: number;
  width?: number;
  height?: number;
  closeGameAfterRecording?: boolean;
  trueView: boolean;
  concatenateSequences?: boolean;
  outputFileName?: string;
  ffmpegSettings?: FfmpegSettings;
  outputFolderPath?: string;
  sequences?: Sequence[];
};

/**
 * The mode determines how video sequences are generated.
 * If no mode is specified, a single sequence from startTick to endTick is created.
 * - player: Generates sequences based on player events (kills, deaths, rounds)
 */
const Mode = {
  Player: 'player',
} as const;
type Mode = (typeof Mode)[keyof typeof Mode];

const QueueSubCommand = {
  List: 'list',
  Pause: 'pause',
  Resume: 'resume',
} as const;
type QueueSubCommand = (typeof QueueSubCommand)[keyof typeof QueueSubCommand];

function isQueueSubCommand(arg: string | undefined): arg is QueueSubCommand {
  return Object.values(QueueSubCommand).includes(arg as QueueSubCommand);
}

export class VideoCommand extends Command {
  public static Name = 'video';
  public static Description = 'Generate videos from demos and control the video generation queue.';
  private readonly options = {
    output: {
      type: 'string',
      short: 'o',
      valueName: 'folder',
      description: 'Folder where the video is generated.',
      defaultValue: 'demo folder',
    },
    'config-file': {
      type: 'string',
      short: 'c',
      valueName: 'path',
      description: 'Path to a JSON config file describing the video, the other options are ignored when provided.',
    },
    framerate: { type: 'string', valueName: 'number', description: 'Video framerate.' },
    width: { type: 'string', valueName: 'number', description: 'Video width, at least 800.' },
    height: { type: 'string', valueName: 'number', description: 'Video height, at least 600.' },
    'recording-system': {
      type: 'string',
      valueName: 'system',
      choices: Object.values(RecordingSystem),
      description: 'Software used to record the game.',
    },
    'recording-output': {
      type: 'string',
      valueName: 'output',
      choices: Object.values(RecordingOutput),
      description: 'Generate a video, the raw images or both.',
    },
    'encoder-software': {
      type: 'string',
      valueName: 'software',
      choices: Object.values(EncoderSoftware),
      description: 'Software used to encode the video.',
    },
    'output-file-name': { type: 'string', valueName: 'name', description: 'Name of the video file.' },
    'close-game-after-recording': {
      type: 'boolean',
      negatable: true,
      description: 'Close the game once the recording is done.',
    },
    'concatenate-sequences': {
      type: 'boolean',
      negatable: true,
      description: 'Concatenate the sequences into a single video.',
    },
    'true-view': { type: 'boolean', negatable: true, description: 'Record what the player actually saw.' },
    'show-x-ray': { type: 'boolean', negatable: true, description: 'Show the X-Ray.' },
    'show-assists': { type: 'boolean', negatable: true, description: 'Show the assists in the death notices.' },
    'show-only-death-notices': {
      type: 'boolean',
      negatable: true,
      description: 'Hide the HUD except the death notices.',
    },
    'record-audio': { type: 'boolean', negatable: true, description: 'Record the game audio.' },
    'player-voices': { type: 'boolean', negatable: true, description: 'Include the players voices.' },
    'death-notices-duration': {
      type: 'string',
      valueName: 'seconds',
      description: 'Duration of the death notices in seconds.',
    },
    cfg: {
      type: 'string',
      valueName: 'commands',
      description: 'Game commands executed before the sequence, one per line.',
    },
    'focus-player': {
      type: 'string',
      valueName: 'steamId',
      description: 'Steam ID of the player to focus the camera on.',
    },
    'ffmpeg-executable-path': {
      type: 'string',
      valueName: 'path',
      description: 'Path to a custom FFmpeg executable.',
      group: 'FFmpeg options',
    },
    'ffmpeg-crf': {
      type: 'string',
      valueName: 'number',
      description: 'Constant Rate Factor, between 0 and 51.',
      group: 'FFmpeg options',
    },
    'ffmpeg-audio-bitrate': {
      type: 'string',
      valueName: 'kbps',
      description: 'Audio bitrate, at least 8.',
      group: 'FFmpeg options',
    },
    'ffmpeg-video-codec': { type: 'string', valueName: 'codec', description: 'Video codec.', group: 'FFmpeg options' },
    'ffmpeg-audio-codec': { type: 'string', valueName: 'codec', description: 'Audio codec.', group: 'FFmpeg options' },
    'ffmpeg-video-container': {
      type: 'string',
      valueName: 'container',
      choices: Object.values(VideoContainer),
      description: 'Video container.',
      group: 'FFmpeg options',
    },
    'ffmpeg-input-parameters': {
      type: 'string',
      valueName: 'parameters',
      description: 'Additional FFmpeg input parameters.',
      group: 'FFmpeg options',
    },
    'ffmpeg-output-parameters': {
      type: 'string',
      valueName: 'parameters',
      description: 'Additional FFmpeg output parameters.',
      group: 'FFmpeg options',
    },
    mode: {
      type: 'string',
      valueName: 'mode',
      choices: Object.values(Mode),
      description: 'Generate the sequences from players events instead of a tick range.',
      group: `Player mode options (--mode ${Mode.Player})`,
    },
    steamids: {
      type: 'string',
      valueName: 'steamIds',
      description: 'Comma-separated list of the players Steam IDs, required.',
      group: `Player mode options (--mode ${Mode.Player})`,
    },
    event: {
      type: 'string',
      valueName: 'event',
      choices: Object.values(PlayerSequenceEvent),
      description: 'Events to record, required.',
      group: `Player mode options (--mode ${Mode.Player})`,
    },
    perspective: {
      type: 'string',
      valueName: 'perspective',
      choices: Object.values(Perspective),
      description: 'Record the events from the players or their enemies point of view.',
      defaultValue: Perspective.Player,
      group: `Player mode options (--mode ${Mode.Player})`,
    },
    rounds: {
      type: 'string',
      valueName: 'rounds',
      description: 'Comma-separated list of round numbers to include, all rounds by default.',
      group: `Player mode options (--mode ${Mode.Player})`,
    },
    'start-seconds-before': {
      type: 'string',
      valueName: 'seconds',
      description: 'Seconds before the event to start the sequence.',
      defaultValue: '2',
      group: `Player mode options (--mode ${Mode.Player})`,
    },
    'end-seconds-after': {
      type: 'string',
      valueName: 'seconds',
      description: 'Seconds after the event to end the sequence.',
      defaultValue: '2',
      group: `Player mode options (--mode ${Mode.Player})`,
    },
  } satisfies CommandOptions;
  private outputFolderPath: string | undefined;
  private demoPath: string = '';
  private startTick: number = 0;
  private endTick: number = 0;
  private framerate: number | undefined;
  private width: number | undefined;
  private height: number | undefined;
  private closeGameAfterRecording: boolean | undefined;
  private concatenateSequences: boolean | undefined;
  private outputFileName: string | undefined;
  private trueView: boolean | undefined;
  private encoderSoftware: EncoderSoftware | undefined;
  private recordingSystem: RecordingSystem | undefined;
  private recordingOutput: RecordingOutput | undefined;
  private ffmpegExecutablePath: string | undefined;
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
  private recordAudio: boolean | undefined;
  private playerVoices: boolean | undefined;
  private deathNoticesDuration: number | undefined;
  private cfg: string | undefined;
  private focusPlayerSteamId: string | undefined;
  private config: VideoCommandConfig | undefined;
  private mode: Mode | undefined;
  private steamIds: string[] = [];
  private event: PlayerSequenceEventType | undefined;
  private perspective: PerspectiveType = Perspective.Player;
  private rounds: number[] = [];
  private startSecondsBefore = 2;
  private endSecondsAfter = 2;

  private readonly listOptions = {
    json: {
      type: 'boolean',
      description: 'Print the queue as JSON.',
      group: `"${QueueSubCommand.List}" options`,
    },
  } satisfies CommandOptions;

  public printHelp() {
    this.printCommandHelp({
      name: VideoCommand.Name,
      description: VideoCommand.Description,
      usages: [
        '<demo-path> <start-tick> <end-tick> [options]',
        `<demo-path> --mode ${Mode.Player} --steamids <steamIds> --event <event> [options]`,
        '--config-file <path>',
        `<${QueueSubCommand.Pause}|${QueueSubCommand.Resume}>`,
        `${QueueSubCommand.List} [--json]`,
      ],
      notes: [
        'The demo must have been analyzed and be present in the database.',
        'Videos are added to the generation queue shared with the app, the command waits for its video to complete and pressing Ctrl+C aborts it. Options not provided default to the app video settings.',
      ],
      arguments: [
        { label: '<demo-path>', description: 'Path of the .dem file.' },
        { label: '<start-tick>', description: 'Tick where the recording starts.' },
        { label: '<end-tick>', description: 'Tick where the recording ends.' },
      ],
      subCommands: [
        { label: QueueSubCommand.List, description: 'Print the videos in the queue and whether the queue is paused.' },
        {
          label: QueueSubCommand.Pause,
          description: 'Pause the queue, the video currently being generated completes before the queue stops.',
        },
        { label: QueueSubCommand.Resume, description: 'Resume the queue.' },
      ],
      options: { ...this.options, ...this.listOptions },
      examples: [
        {
          description: 'Record a tick range',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'demo.dem')} 1000 5000`,
        },
        {
          description: 'Record the kills of a player',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'demo.dem')} --mode ${Mode.Player} --steamids 76561198000000000 --event ${PlayerSequenceEvent.Kills}`,
        },
      ],
    });
  }

  public async run() {
    const [firstArg] = this.args;
    if (isQueueSubCommand(firstArg)) {
      return this.runQueueSubCommand(firstArg);
    }

    await this.parseArgs();
    await this.initDatabaseConnection();
    await migrateSettings();

    const settings = await getSettings();
    const demo = await getDemoFromFilePath(this.demoPath);

    let parameters: AddVideoPayload = {
      demoPath: this.demoPath,
      // The queue nests the video output in a folder named after the video id.
      outputFolderPath: this.outputFolderPath ?? path.dirname(this.demoPath),
      checksum: demo.checksum,
      game: demo.game,
      mapName: demo.mapName,
      tickrate: demo.tickrate,
      recordingSystem: this.recordingSystem ?? settings.video.recordingSystem,
      recordingOutput: this.recordingOutput ?? settings.video.recordingOutput,
      encoderSoftware: this.encoderSoftware ?? settings.video.encoderSoftware,
      framerate: this.framerate ?? settings.video.framerate,
      width: this.width ?? settings.video.width,
      height: this.height ?? settings.video.height,
      closeGameAfterRecording: this.closeGameAfterRecording ?? settings.video.closeGameAfterRecording,
      concatenateSequences: this.concatenateSequences ?? settings.video.concatenateSequences,
      outputFileName: this.outputFileName ?? settings.video.outputFileName,
      trueView: this.trueView ?? settings.video.trueView,
      sequences: [],
      ffmpegSettings: {
        customLocationEnabled:
          this.ffmpegExecutablePath !== undefined ? true : settings.video.ffmpegSettings.customLocationEnabled,
        customExecutableLocation: this.ffmpegExecutablePath ?? settings.video.ffmpegSettings.customExecutableLocation,
        audioBitrate: this.ffmpegAudioBitrate ?? settings.video.ffmpegSettings.audioBitrate,
        constantRateFactor: this.ffmpegCrf ?? settings.video.ffmpegSettings.constantRateFactor,
        videoCodec: this.ffmpegVideoCodec ?? settings.video.ffmpegSettings.videoCodec,
        audioCodec: this.ffmpegAudioCodec ?? settings.video.ffmpegSettings.audioCodec,
        videoContainer: this.ffmpegVideoContainer ?? settings.video.ffmpegSettings.videoContainer,
        inputParameters: this.ffmpegInputParameters ?? settings.video.ffmpegSettings.inputParameters,
        outputParameters: this.ffmpegOutputParameters ?? settings.video.ffmpegSettings.outputParameters,
      },
    };

    const config = this.config;
    if (config) {
      parameters = {
        ...parameters,
        recordingSystem: config.recordingSystem ?? parameters.recordingSystem,
        recordingOutput: config.recordingOutput ?? parameters.recordingOutput,
        encoderSoftware: config.encoderSoftware ?? parameters.encoderSoftware,
        framerate: config.framerate ?? parameters.framerate,
        width: config.width ?? parameters.width,
        height: config.height ?? parameters.height,
        trueView: config.trueView ?? parameters.trueView,
        closeGameAfterRecording: config.closeGameAfterRecording ?? parameters.closeGameAfterRecording,
        concatenateSequences: config.concatenateSequences ?? parameters.concatenateSequences,
        outputFileName: config.outputFileName ?? parameters.outputFileName,
        ffmpegSettings: config.ffmpegSettings ?? parameters.ffmpegSettings,
        outputFolderPath: config.outputFolderPath ?? parameters.outputFolderPath,
        sequences: config.sequences ?? parameters.sequences,
      };
    } else if (this.mode === 'player') {
      if (this.steamIds.length === 0) {
        throw new InvalidArgument(`--steamids is required for player mode`);
      }
      if (!this.event) {
        throw new InvalidArgument(`--event is required for player mode`);
      }

      const [match] = await fetchMatchesByChecksums([demo.checksum]);
      if (!match) {
        throw new CommandError('Match not found in the database, make sure the demo has been analyzed.');
      }

      let sequences: Sequence[];
      if (this.event === PlayerSequenceEvent.Rounds) {
        sequences = buildPlayersRoundsSequences({
          match,
          steamIds: this.steamIds,
          rounds: this.rounds,
          startSecondsBeforeEvent: this.startSecondsBefore,
          endSecondsAfterEvent: this.endSecondsAfter,
          settings: {
            showOnlyDeathNotices: this.showOnlyDeathNotices ?? settings.video.showOnlyDeathNotices,
            showXRay: this.showXRay ?? settings.video.showXRay,
            showAssists: this.showAssists ?? settings.video.showAssists,
            recordAudio: this.recordAudio ?? settings.video.recordAudio,
            playerVoicesEnabled: this.playerVoices ?? settings.video.playerVoicesEnabled,
            deathNoticesDuration: this.deathNoticesDuration ?? settings.video.deathNoticesDuration,
          },
          firstSequenceNumber: 1,
        });
      } else {
        sequences = buildPlayersEventSequences({
          event: this.event,
          match,
          steamIds: this.steamIds,
          rounds: this.rounds,
          perspective: this.perspective,
          startSecondsBeforeEvent: this.startSecondsBefore,
          endSecondsAfterEvent: this.endSecondsAfter,
          settings: {
            showOnlyDeathNotices: this.showOnlyDeathNotices ?? settings.video.showOnlyDeathNotices,
            showXRay: this.showXRay ?? settings.video.showXRay,
            showAssists: this.showAssists ?? settings.video.showAssists,
            recordAudio: this.recordAudio ?? settings.video.recordAudio,
            playerVoicesEnabled: this.playerVoices ?? settings.video.playerVoicesEnabled,
            deathNoticesDuration: this.deathNoticesDuration ?? settings.video.deathNoticesDuration,
          },
          weapons: [],
          firstSequenceNumber: 1,
        });
      }

      if (sequences.length === 0) {
        throw new CommandError('No sequences generated, check that the players have matching events in the demo.');
      }

      parameters.sequences = sequences;
    } else {
      const player = this.focusPlayerSteamId ? await fetchPlayer(this.focusPlayerSteamId) : undefined;
      parameters.sequences = [
        {
          number: 1,
          startTick: this.startTick,
          endTick: this.endTick,
          showXRay: this.showXRay ?? settings.video.showXRay,
          showAssists: this.showAssists ?? settings.video.showAssists,
          showOnlyDeathNotices: this.showOnlyDeathNotices ?? settings.video.showOnlyDeathNotices,
          playersOptions: [],
          cameras: [],
          recordAudio: this.recordAudio ?? settings.video.recordAudio,
          playerCameras: player
            ? [
                {
                  tick: this.startTick,
                  playerSteamId: player.steamId,
                  playerName: player.name,
                },
              ]
            : [],
          playerVoicesEnabled: this.playerVoices ?? settings.video.playerVoicesEnabled,
          deathNoticesDuration: this.deathNoticesDuration ?? settings.video.deathNoticesDuration,
          cfg: this.cfg,
        },
      ];
    }

    const client = await this.connectToDaemon();
    await this.installDependenciesIfNecessary(client, parameters);

    const video = await client.send(
      {
        name: CliClientMessageName.AddVideoToQueue,
        payload: parameters,
      },
      { timeoutMs: 30_000 },
    );

    await this.waitForVideoGeneration(client, video);
    client.close();
  }

  private async runQueueSubCommand(subCommand: QueueSubCommand) {
    const { values, positionals } = this.parseOptions(this.listOptions, { allowPositionals: true });
    if (positionals.length > 1) {
      throw new InvalidArgument(`Unexpected argument: ${positionals[1]}`);
    }
    const isJsonOutput = values.json ?? false;
    if (isJsonOutput) {
      if (subCommand !== QueueSubCommand.List) {
        throw new InvalidArgument(`The --json option is available only with "${QueueSubCommand.List}"`);
      }
      output.enableJsonMode();
    }

    const client = await this.connectToDaemon();

    switch (subCommand) {
      case QueueSubCommand.Pause:
        await client.send({ name: CliClientMessageName.PauseVideoQueue });
        output.log('Video queue paused, the video currently being generated will complete before the queue stops.');
        break;
      case QueueSubCommand.Resume:
        await client.send({ name: CliClientMessageName.ResumeVideoQueue });
        output.log('Video queue resumed');
        break;
      case QueueSubCommand.List: {
        const { videos, isPaused } = await client.send({ name: CliClientMessageName.GetVideoQueue });
        if (isJsonOutput) {
          output.json({
            isPaused,
            videos: videos.map((video) => ({
              id: video.id,
              date: video.date,
              status: video.status,
              demoPath: video.demoPath,
              outputFolderPath: video.outputFolderPath,
              sequenceCount: video.sequences.length,
            })),
          });
          break;
        }
        output.print(`The queue is ${isPaused ? 'paused' : 'running'}`);
        if (videos.length === 0) {
          output.print('No videos in the queue');
          break;
        }

        output.print('');
        output.table(
          ['ID', 'STATUS', 'ADDED', 'SEQUENCES', 'DEMO'],
          videos.map((video) => [
            video.id,
            this.getVideoStatusCell(video),
            formatDate(new Date(video.date)),
            String(video.sequences.length),
            path.basename(video.demoPath),
          ]),
        );
        break;
      }
    }

    client.close();
  }

  private getVideoStatusCell(video: Video): TableCell {
    switch (video.status) {
      case VideoStatus.Pending:
        return { text: 'Pending', style: 'dim' };
      case VideoStatus.Recording:
        return { text: 'Recording', style: 'cyan' };
      case VideoStatus.MovingFiles:
        return { text: 'Moving files', style: 'cyan' };
      case VideoStatus.Converting:
        return { text: `Converting ${video.currentSequencePosition}/${video.sequences.length}`, style: 'cyan' };
      case VideoStatus.Concatenating:
        return { text: 'Concatenating', style: 'cyan' };
      case VideoStatus.Success:
        return { text: 'Done', style: 'green' };
      case VideoStatus.Error:
        return { text: 'Failed', style: 'red' };
    }
  }

  private async installDependenciesIfNecessary(client: CliWebSocketClient, parameters: AddVideoPayload) {
    const installTimeout = { timeoutMs: 300_000 };
    if (parameters.recordingSystem === RecordingSystem.HLAE && !(await isHlaeInstalled())) {
      output.progress('Installing HLAE...');
      await client.send({ name: CliClientMessageName.InstallHlae }, installTimeout);
    }

    const shouldGenerateVideo = parameters.recordingOutput !== RecordingOutput.Images;
    if (!shouldGenerateVideo) {
      return;
    }

    const { encoderSoftware } = parameters;
    if (encoderSoftware === EncoderSoftware.VirtualDub && !(await isVirtualDubInstalled())) {
      output.progress('Installing VirtualDub...');
      await client.send({ name: CliClientMessageName.InstallVirtualDub }, installTimeout);
    }

    if (
      (encoderSoftware === EncoderSoftware.FFmpeg || parameters.concatenateSequences) &&
      typeof this.ffmpegExecutablePath !== 'string' &&
      !(await isFfmpegInstalled())
    ) {
      output.progress('Installing FFmpeg...');
      await client.send({ name: CliClientMessageName.InstallFfmpeg }, installTimeout);
    }
  }

  private async waitForVideoGeneration(client: CliWebSocketClient, video: Video) {
    let resolveCompletion: () => void;
    const completion = new Promise<void>((resolve) => {
      resolveCompletion = resolve;
    });
    let hasError = false;
    let lastPrintedProgress = '';
    let statusMessage = 'Waiting for the video generation...';
    const startTime = Date.now();
    // Recording can take minutes without status update, the elapsed time shows that the generation is still running.
    const printElapsedTime = () => {
      output.liveProgress(`${statusMessage} ${formatDuration(Date.now() - startTime)}`);
    };
    const printStatus = (message: string) => {
      statusMessage = message;
      output.progress(message);
      printElapsedTime();
    };

    const onVideoUpdated = (updatedVideo: Video) => {
      if (updatedVideo.id !== video.id) {
        return;
      }

      const progress = `${updatedVideo.status}:${updatedVideo.currentSequence ?? ''}`;
      if (progress === lastPrintedProgress) {
        return;
      }
      lastPrintedProgress = progress;

      const sequenceCount = updatedVideo.sequences.length;
      switch (updatedVideo.status) {
        case VideoStatus.Recording:
          printStatus(`Recording ${sequenceCount} ${sequenceCount === 1 ? 'sequence' : 'sequences'}...`);
          break;
        case VideoStatus.MovingFiles:
          printStatus('Moving files...');
          break;
        case VideoStatus.Converting:
          printStatus(
            `Converting sequence #${updatedVideo.currentSequence} (${updatedVideo.currentSequencePosition}/${sequenceCount})...`,
          );
          break;
        case VideoStatus.Concatenating:
          printStatus('Concatenating sequences...');
          break;
        case VideoStatus.Success:
          output.clearProgress();
          output.success(
            `Video generated in ${output.formatPath(updatedVideo.outputFolderPath)} (${formatDuration(Date.now() - startTime)})`,
          );
          resolveCompletion();
          break;
        case VideoStatus.Error: {
          hasError = true;
          const lines = ['Error while generating the video'];
          if (updatedVideo.errorCode !== undefined) {
            lines.push(getErrorCodeMessage(updatedVideo.errorCode));
          }
          if (updatedVideo.output !== '') {
            lines.push(updatedVideo.output);
          }
          output.clearProgress();
          output.error(lines.join('\n'));
          resolveCompletion();
          break;
        }
      }
    };

    const onVideosRemovedFromQueue = (removedVideoIds: string[]) => {
      if (removedVideoIds.includes(video.id)) {
        hasError = true;
        output.clearProgress();
        output.error('The video has been removed from the queue');
        resolveCompletion();
      }
    };

    client.on(ServerPushMessageName.VideoUpdated, onVideoUpdated);
    client.on(ServerPushMessageName.VideosRemovedFromQueue, onVideosRemovedFromQueue);

    // The queue starts paused: resuming it starts the generation, processing any video queued before this one first.
    printStatus(statusMessage);
    await client.send({ name: CliClientMessageName.ResumeVideoQueue });
    const elapsedTimeIntervalId = setInterval(printElapsedTime, 1000);

    await completion;
    clearInterval(elapsedTimeIntervalId);

    if (hasError) {
      this.markAsFailed();
    }
  }

  private async parseArgs() {
    const { values, positionals } = this.parseOptions(this.options, { allowPositionals: true });

    const configFilePath = values['config-file'];
    if (configFilePath) {
      try {
        const json = await fs.readFile(configFilePath, { encoding: 'utf8' });
        const matchHashComment = new RegExp(/(#.*)/, 'gi');
        // Remove comments (//, /* */ and #) from JSONC file
        const commentFreeJson = json
          .replace(matchHashComment, '')
          .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')
          .trim();
        this.config = JSON.parse(commentFreeJson) as VideoCommandConfig;

        const { demoPath } = this.config;
        if (typeof demoPath !== 'string' || !demoPath.endsWith('.dem')) {
          throw new InvalidArgument('Invalid demo path');
        }
        this.demoPath = path.resolve(demoPath);
        return;
      } catch (error) {
        if (error instanceof InvalidArgument) {
          throw error;
        }
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          throw new InvalidArgument(`Config file not found: ${configFilePath}`);
        }
        throw new CommandError(`Failed to read the config file ${configFilePath}`, { cause: error });
      }
    }

    if (positionals.length === 0) {
      throw new InvalidArgument('Missing demo path');
    }

    const [demoPath] = positionals;
    if (typeof demoPath !== 'string' || !demoPath.endsWith('.dem')) {
      throw new InvalidArgument('Invalid demo path');
    }
    this.demoPath = path.resolve(demoPath);

    const mode = values.mode;
    if (typeof mode === 'string') {
      if (mode !== 'player') {
        throw new InvalidArgument('Invalid mode. Supported values: player');
      }
      this.mode = mode;

      const steamIdsValue = values.steamids;
      if (typeof steamIdsValue !== 'string') {
        throw new InvalidArgument(`The --steamids option is required for player mode`);
      }
      this.steamIds = steamIdsValue.split(',').map((id) => id.trim());
      if (this.steamIds.length === 0) {
        throw new InvalidArgument('At least one Steam ID must be provided');
      }

      const eventValue = values.event;
      if (typeof eventValue !== 'string') {
        throw new InvalidArgument(`The --event option is required for player mode`);
      }
      if (!isValidPlayerSequenceEvent(eventValue)) {
        throw new InvalidArgument(`Invalid event. Supported values: ${Object.values(PlayerSequenceEvent).join(', ')}`);
      }
      this.event = eventValue;

      const perspectiveValue = values.perspective;
      if (typeof perspectiveValue === 'string') {
        if (!isValidPerspective(perspectiveValue)) {
          throw new InvalidArgument(`Invalid perspective. Supported values: ${Object.values(Perspective).join(', ')}`);
        }
        this.perspective = perspectiveValue;
      }

      const roundsValue = values.rounds;
      if (typeof roundsValue === 'string') {
        const rounds = roundsValue.split(',').map((value) => {
          const number = Number(value.trim());
          if (Number.isNaN(number) || number < 1) {
            throw new InvalidArgument(`Invalid round number: ${value}`);
          }
          return number;
        });
        this.rounds = rounds;
      }

      const startSecondsBeforeValue = values['start-seconds-before'];
      if (typeof startSecondsBeforeValue === 'string') {
        const seconds = Number(startSecondsBeforeValue);
        if (Number.isNaN(seconds) || seconds < 0) {
          throw new InvalidArgument('Start seconds before must be a non-negative number');
        }
        this.startSecondsBefore = seconds;
      }

      const endSecondsAfterValue = values['end-seconds-after'];
      if (typeof endSecondsAfterValue === 'string') {
        const seconds = Number(endSecondsAfterValue);
        if (Number.isNaN(seconds) || seconds < 0) {
          throw new InvalidArgument('End seconds after must be a non-negative number');
        }
        this.endSecondsAfter = seconds;
      }
    } else {
      if (positionals.length < 3) {
        throw new InvalidArgument('Missing arguments');
      }

      const startTick = Number(positionals[1]);
      if (Number.isNaN(startTick)) {
        throw new InvalidArgument('Start tick is invalid');
      }
      if (startTick < 0) {
        throw new InvalidArgument('Start tick must be a positive number');
      }
      this.startTick = startTick;

      const endTick = Number(positionals[2]);
      if (Number.isNaN(endTick)) {
        throw new InvalidArgument('End tick is invalid');
      }
      if (endTick < 0) {
        throw new InvalidArgument('End tick must be a positive number');
      }
      if (endTick <= startTick) {
        throw new InvalidArgument('End tick must be greater than start tick');
      }
      this.endTick = endTick;
    }

    const outputFolderPath = values.output;
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
    if (values.framerate) {
      const framerate = Number(values.framerate);
      if (Number.isNaN(framerate)) {
        throw new InvalidArgument('Framerate is not a number');
      }
      if (framerate < 0) {
        throw new InvalidArgument('Framerate must be a positive number');
      }
      this.framerate = framerate;
    }
    if (values.width) {
      const width = Number(values.width);
      if (Number.isNaN(width)) {
        throw new InvalidArgument('Width is not a number');
      }
      if (width < 800) {
        throw new InvalidArgument('Width must be at least 800');
      }
      this.width = width;
    }
    if (values.height) {
      const height = Number(values.height);
      if (Number.isNaN(height)) {
        throw new InvalidArgument('Height is not a number');
      }
      if (height < 600) {
        throw new InvalidArgument('Height must be at least 600');
      }
      this.height = height;
    }
    this.closeGameAfterRecording = values['close-game-after-recording'];
    this.concatenateSequences = values['concatenate-sequences'];
    const outputFileName = values['output-file-name'];
    if (typeof outputFileName === 'string') {
      this.outputFileName = outputFileName;
    }
    const encoderSoftware = values['encoder-software'];
    if (encoderSoftware !== undefined) {
      if (!isValidEncoderSoftware(encoderSoftware)) {
        throw new InvalidArgument('Invalid encoder software');
      }
      this.encoderSoftware = encoderSoftware;
    }
    const recordingSystem = values['recording-system'];
    if (recordingSystem !== undefined) {
      if (!isValidRecordingSystem(recordingSystem)) {
        throw new InvalidArgument('Invalid recording system');
      }
      this.recordingSystem = recordingSystem;
    }
    const recordingOutput = values['recording-output'];
    if (recordingOutput !== undefined) {
      if (!isValidRecordingOutput(recordingOutput)) {
        throw new InvalidArgument('Invalid recording output');
      }
      this.recordingOutput = recordingOutput;
    }
    const ffmpegExecutablePath = values['ffmpeg-executable-path'];
    if (typeof ffmpegExecutablePath === 'string') {
      const ffmpegExecutableExists = await fs.pathExists(ffmpegExecutablePath);
      if (!ffmpegExecutableExists) {
        throw new InvalidArgument('FFmpeg executable path does not exist');
      }
      this.ffmpegExecutablePath = ffmpegExecutablePath;
    }
    if (values['ffmpeg-crf'] !== undefined) {
      const ffmpegCrf = Number(values['ffmpeg-crf']);
      if (Number.isNaN(ffmpegCrf)) {
        throw new InvalidArgument('FFmpeg CRF is not a number');
      }
      if (ffmpegCrf < 0 || ffmpegCrf > 51) {
        throw new InvalidArgument('FFmpeg CRF must be between 0 and 51');
      }
      this.ffmpegCrf = ffmpegCrf;
    }
    if (values['ffmpeg-audio-bitrate'] !== undefined) {
      const ffmpegAudioBitrate = Number(values['ffmpeg-audio-bitrate']);
      if (Number.isNaN(ffmpegAudioBitrate)) {
        throw new InvalidArgument('FFmpeg audio bitrate is not a number');
      }
      if (ffmpegAudioBitrate < 8) {
        throw new InvalidArgument('FFmpeg audio bitrate must be at least 8');
      }
      this.ffmpegAudioBitrate = ffmpegAudioBitrate;
    }
    if (values['ffmpeg-video-codec'] !== undefined) {
      this.ffmpegVideoCodec = values['ffmpeg-video-codec'];
    }
    if (values['ffmpeg-audio-codec']) {
      this.ffmpegAudioCodec = values['ffmpeg-audio-codec'];
    }
    const videoContainer = values['ffmpeg-video-container'];
    if (videoContainer !== undefined) {
      if (!isValidVideoContainer(videoContainer)) {
        throw new InvalidArgument('Invalid video container');
      }
      this.ffmpegVideoContainer = videoContainer;
    }
    if (values['ffmpeg-input-parameters'] !== undefined) {
      this.ffmpegInputParameters = values['ffmpeg-input-parameters'];
    }
    if (values['ffmpeg-output-parameters']) {
      this.ffmpegOutputParameters = values['ffmpeg-output-parameters'];
    }
    this.showXRay = values['show-x-ray'];
    this.showAssists = values['show-assists'];
    this.showOnlyDeathNotices = values['show-only-death-notices'];
    this.trueView = values['true-view'];
    this.playerVoices = values['player-voices'];
    this.recordAudio = values['record-audio'];
    if (values['death-notices-duration']) {
      const deathNoticesDuration = Number(values['death-notices-duration']);
      if (Number.isNaN(deathNoticesDuration)) {
        throw new InvalidArgument('Death notices duration is not a number');
      }
      if (deathNoticesDuration < 0) {
        throw new InvalidArgument('Death notices duration must be at least 0');
      }
      this.deathNoticesDuration = deathNoticesDuration;
    }
    if (values.cfg) {
      this.cfg = values.cfg;
    }
    if (values['focus-player']) {
      this.focusPlayerSteamId = values['focus-player'];
    }
  }
}
