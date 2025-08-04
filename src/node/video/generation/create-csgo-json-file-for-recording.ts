import { JSONActionsFileGenerator } from 'csdm/node/counter-strike/json-actions-file/json-actions-file-generator';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/generation/get-sequence-name';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';
import { Game } from 'csdm/common/types/counter-strike';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { VideoContainer } from 'csdm/common/types/video-container';

type Options = {
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  encoderSoftware: EncoderSoftware;
  outputFolderPath: string;
  framerate: number;
  demoPath: string;
  sequences: Sequence[];
  closeGameAfterRecording: boolean;
  tickrate: number;
  ffmpegSettings: {
    constantRateFactor: number;
    videoContainer: VideoContainer;
    videoCodec: string;
    outputParameters: string;
  };
};

function getHlaeOutputFolderPath(outputFolderPath: string, sequence: Sequence) {
  return `${windowsToUnixPathSeparator(outputFolderPath)}/${getSequenceName(sequence)}`;
}

/**
 * Returns a JSON compatible HLAE "mirv_replace_name" command.
 * It wraps the "mirv_replace_name" command in a "mirv_exec" command in order to support possible double quotes.
 *
 * mirv_exec doc: https://github.com/advancedfx/advancedfx/wiki/Source%3Amirv_exec
 * mirv_replace_name doc: https://github.com/advancedfx/advancedfx/wiki/Source%3Amirv_replace_name
 */
function buildReplacePlayerNameCommand(player: SequencePlayerOptions) {
  return `mirv_exec mirv_replace_name filter add x${player.steamId} "${player.playerName.replaceAll('"', '{QUOTE}')}"`;
}

export async function createCsgoJsonFileForRecording({
  recordingSystem,
  recordingOutput,
  encoderSoftware,
  outputFolderPath,
  framerate,
  demoPath,
  sequences,
  closeGameAfterRecording,
  tickrate,
  ffmpegSettings,
}: Options) {
  const json = new JSONActionsFileGenerator(demoPath, Game.CSGO);
  const mandatoryCommands = [
    'sv_cheats 1',
    'volume 1',
    'net_graph 0',
    'host_timescale 0',
    'mirv_snd_timescale 1',
    'mirv_gameoverlay enable 0',
  ];

  const firstActionsTick = Math.min(tickrate, 128);
  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];

    for (const command of mandatoryCommands) {
      json.addExecCommand(firstActionsTick, command);
    }

    json.addExecCommand(firstActionsTick, `cl_draw_only_deathnotices ${sequence.showOnlyDeathNotices ? 1 : 0}`);
    json.addExecCommand(firstActionsTick, `mirv_deathmsg lifetime ${sequence.deathNoticesDuration}`);

    if (sequence.playerVoicesEnabled) {
      json.enablePlayerVoices(firstActionsTick);
    } else {
      json.disablePlayerVoices(firstActionsTick);
    }

    const roundedTickrate = Math.round(tickrate);
    const setupSequenceTick = sequence.startTick - roundedTickrate > 0 ? sequence.startTick - roundedTickrate : 1;

    const hlaeOutputFolderPath = getHlaeOutputFolderPath(outputFolderPath, sequence);
    const presetName =
      recordingOutput === RecordingOutput.Video && encoderSoftware === EncoderSoftware.FFmpeg
        ? `csdmPreset${sequence.number}`
        : 'afxClassic';

    json
      .addExecCommand(setupSequenceTick, `mirv_streams record startMovieWav 1`)
      .addExecCommand(setupSequenceTick, `mirv_streams record name "${hlaeOutputFolderPath}"`)
      .addExecCommand(setupSequenceTick, `mirv_replace_name filter clear`)
      .addExecCommand(setupSequenceTick, `spec_show_xray ${sequence.showXRay ? 1 : 0}`)
      .addExecCommand(setupSequenceTick, `host_framerate ${framerate}`);

    if (presetName !== 'afxClassic') {
      let presetParameters = `-c:v ${ffmpegSettings.videoCodec}`;
      if (ffmpegSettings.outputParameters === '') {
        presetParameters += ` -crf ${ffmpegSettings.constantRateFactor}`;
      } else {
        presetParameters += ` ${ffmpegSettings.outputParameters}`;
      }
      json
        .addExecCommand(
          setupSequenceTick,
          `mirv_streams settings add ffmpeg ${presetName} "${presetParameters} {QUOTE}${hlaeOutputFolderPath}\\\\video.${ffmpegSettings.videoContainer}{QUOTE}"`,
        )
        .addExecCommand(setupSequenceTick, `mirv_streams settings edit afxDefault settings ${presetName}`);
    }

    if (typeof sequence.cfg === 'string') {
      const commands = sequence.cfg.split('\n');
      for (const command of commands) {
        json.addExecCommand(setupSequenceTick, command);
      }
    }

    json.addSkipAhead(firstActionsTick, setupSequenceTick);

    for (const camera of sequence.cameras) {
      json.addSpecPlayer(camera.tick, camera.playerSteamId);
    }

    for (const playerOptions of sequence.playersOptions) {
      const replacePlayerNameCommand = buildReplacePlayerNameCommand(playerOptions);
      json.addExecCommand(setupSequenceTick, replacePlayerNameCommand);

      if (!playerOptions.showKill) {
        json.addExecCommand(
          setupSequenceTick,
          `mirv_deathmsg filter add attackerMatch=x${playerOptions.steamId} block=1`,
        );
      }
      if (playerOptions.highlightKill) {
        json.addExecCommand(
          setupSequenceTick,
          `mirv_deathmsg filter add attackerMatch=x${playerOptions.steamId} attackerIsLocal=1`,
        );
      }
    }

    if (recordingSystem === RecordingSystem.HLAE) {
      json
        .addExecCommand(sequence.startTick, 'mirv_streams add normal defaultNormal')
        .addExecCommand(sequence.startTick, 'mirv_streams record start')
        .addExecCommand(sequence.endTick, 'mirv_streams record end');
    } else {
      json
        .addExecCommand(sequence.startTick, `startmovie ${getSequenceName(sequence)}`)
        .addExecCommand(sequence.endTick, 'endmovie');
    }

    if (closeGameAfterRecording && i === sequences.length - 1) {
      json.addExecCommand(sequences[sequences.length - 1].endTick + 1, 'quit');
    } else {
      json.addGoToNextSequence(sequence.endTick + tickrate);
    }
  }

  await json.write();
}
