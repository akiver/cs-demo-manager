import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/generation/get-sequence-name';
import { JSONActionsFileGenerator } from 'csdm/node/counter-strike/json-actions-file/json-actions-file-generator';
import { Game } from 'csdm/common/types/counter-strike';
import { generatePlayerVoicesValues } from 'csdm/node/counter-strike/launcher/generate-player-voices-values';
import type { PlayerWatchInfo } from 'csdm/common/types/player-watch-info';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { VideoContainer } from 'csdm/common/types/video-container';

function getHlaeOutputFolderPath(outputFolderPath: string, sequence: Sequence) {
  return `${windowsToUnixPathSeparator(outputFolderPath)}/${getSequenceName(sequence)}`;
}

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
  players: PlayerWatchInfo[];
  ffmpegSettings: {
    constantRateFactor: number;
    videoContainer: VideoContainer;
    videoCodec: string;
    outputParameters: string;
  };
};

export async function createCs2JsonActionsFileForRecording({
  recordingSystem,
  recordingOutput,
  encoderSoftware,
  outputFolderPath,
  framerate,
  demoPath,
  sequences,
  closeGameAfterRecording,
  tickrate,
  players,
  ffmpegSettings,
}: Options) {
  const json = new JSONActionsFileGenerator(demoPath, Game.CS2);

  const mandatoryCommands = [
    'sv_cheats 1',
    'volume 1',
    'cl_hud_telemetry_frametime_show 0',
    'cl_hud_telemetry_net_misdelivery_show 0',
    'cl_hud_telemetry_ping_show 0',
    'cl_hud_telemetry_serverrecvmargin_graph_show 0',
    'r_show_build_info 0',
    'mirv_streams record screen enabled 1',
  ];

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];

    for (const command of mandatoryCommands) {
      json.addExecCommand(1, command);
    }

    json.addExecCommand(1, `cl_draw_only_deathnotices ${sequence.showOnlyDeathNotices ? 1 : 0}`);
    json.addExecCommand(1, `mirv_deathmsg lifetime ${sequence.deathNoticesDuration}`);

    if (sequence.playerVoicesEnabled) {
      json.enablePlayerVoices(1);
    } else {
      json.disablePlayerVoices(1);
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
      .addExecCommand(setupSequenceTick, `mirv_deathmsg clear`)
      .addExecCommand(setupSequenceTick, `spec_show_xray ${sequence.showXRay ? 1 : 0}`);

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
        .addExecCommand(setupSequenceTick, `mirv_streams record screen settings ${presetName}`);
    }

    if (recordingSystem === RecordingSystem.HLAE) {
      json.addExecCommand(setupSequenceTick, `mirv_streams record fps ${framerate}`);
    } else {
      json.addExecCommand(setupSequenceTick, `host_framerate ${framerate}`);
    }

    if (typeof sequence.cfg === 'string') {
      const commands = sequence.cfg.split('\n');
      for (const command of commands) {
        json.addExecCommand(setupSequenceTick, command);
      }
    }

    // Pause the playback for a few seconds to avoid seeing the loading screen/tint effect.
    // Do it a few ticks before the sequence's start tick because some ticks may be skipped between the time that the
    // plugin pauses the playback and the time that the game actually pauses the playback (it would result in
    // startmovie commands not being executed and so missing sequences).
    json.addPausePlayback(sequence.startTick - 4);

    json.addSkipAhead(1, setupSequenceTick);

    for (const camera of sequence.cameras) {
      const player = players.find((player) => player.steamId === camera.playerSteamId);
      if (player) {
        json.addSpecPlayer(camera.tick, player.slot);
      }
    }

    for (const playerOptions of sequence.playersOptions) {
      // Unlike CS:GO, support for double quotes in player's name is not supported in CS2.
      // The reason is that the "mirv_exec" command used as a workaround in CS:GO is not available for CS2.
      const replacePlayerNameCommand = `mirv_replace_name byXuid add x${playerOptions.steamId} "${playerOptions.playerName}"`;
      json.addExecCommand(setupSequenceTick, replacePlayerNameCommand);

      if (!playerOptions.showKill) {
        json.addExecCommand(
          setupSequenceTick,
          `mirv_deathmsg filter add attackerMatch=x${playerOptions.steamId} block=1`,
        );
      } else if (playerOptions.highlightKill) {
        json.addExecCommand(
          setupSequenceTick,
          `mirv_deathmsg filter add attackerMatch=x${playerOptions.steamId} attackerIsLocal=1`,
        );
      }

      if (playerOptions.isVoiceEnabled) {
        const playersWithVoiceEnabled = sequence.playersOptions.filter((playerOptions) => playerOptions.isVoiceEnabled);
        if (playersWithVoiceEnabled.length !== sequence.playersOptions.length) {
          const userIds: number[] = [];
          for (const playerOptions of playersWithVoiceEnabled) {
            const player = players.find((player) => player.steamId === playerOptions.steamId);
            if (player) {
              userIds.push(player.userId);
            }
          }
          const { valueLow, valueHigh } = generatePlayerVoicesValues(userIds);
          json.addExecCommand(setupSequenceTick, `tv_listen_voice_indices ${valueLow}`);
          json.addExecCommand(setupSequenceTick, `tv_listen_voice_indices_h ${valueHigh}`);
        }
      }
    }

    if (recordingSystem === RecordingSystem.HLAE) {
      json
        .addExecCommand(sequence.startTick, `mirv_streams record start`)
        .addExecCommand(sequence.endTick, 'mirv_streams record end');
    } else {
      json
        .addExecCommand(sequence.startTick, `startmovie ${getSequenceName(sequence)}`)
        .addExecCommand(sequence.endTick, 'endmovie');
    }

    if (closeGameAfterRecording && i === sequences.length - 1) {
      json.addExecCommand(sequences[sequences.length - 1].endTick + 64, 'quit');
    } else {
      json.addGoToNextSequence(sequence.endTick + 64);
    }
  }

  await json.write();
}
