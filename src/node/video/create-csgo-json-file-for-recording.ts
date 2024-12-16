import { JSONActionsFileGenerator } from '../counter-strike/json-actions-file/json-actions-file-generator';
import { isWindows } from 'csdm/node/os/is-windows';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';
import { Game } from 'csdm/common/types/counter-strike';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';

type Options = {
  rawFilesFolderPath: string;
  framerate: number;
  demoPath: string;
  sequences: Sequence[];
  closeGameAfterRecording: boolean;
  showOnlyDeathNotices: boolean;
  deathNoticesDuration: number;
  tickrate: number;
};

function getHlaeRawFilesFolderPath(rawFilesFolderPath: string, sequence: Sequence) {
  return `${windowsToUnixPathSeparator(rawFilesFolderPath)}/${getSequenceName(sequence)}`;
}

/**
 * Returns a JSON compatible HLAE "mirv_replace_name" command.
 * It wraps the "mirv_replace_name" command in a "mirv_exec" command in order to support possible double quotes.
 *
 * mirv_exec doc: https://github.com/advancedfx/advancedfx/wiki/Source%3Amirv_exec
 * mirv_replace_name doc: https://github.com/advancedfx/advancedfx/wiki/Source%3Amirv_replace_name
 */
function buildReplacePlayerNameCommand(deathNotice: DeathNoticesPlayerOptions) {
  return `mirv_exec mirv_replace_name filter add x${deathNotice.steamId} "${deathNotice.playerName.replaceAll('"', '{QUOTE}')}"`;
}

export async function createCsgoJsonFileForRecording({
  rawFilesFolderPath,
  framerate,
  demoPath,
  sequences,
  closeGameAfterRecording,
  showOnlyDeathNotices,
  deathNoticesDuration,
  tickrate,
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

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];

    for (const command of mandatoryCommands) {
      json.addExecCommand(1, command);
    }

    if (showOnlyDeathNotices) {
      json.addExecCommand(1, 'cl_draw_only_deathnotices 1');
    }

    json.addExecCommand(1, `mirv_deathmsg lifetime ${deathNoticesDuration}`);

    if (sequence.playerVoicesEnabled) {
      json.enablePlayerVoices(1);
    } else {
      json.disablePlayerVoices(1);
    }

    const roundedTickrate = Math.round(tickrate);
    const setupSequenceTick = sequence.startTick - roundedTickrate > 0 ? sequence.startTick - roundedTickrate : 1;

    json
      .addExecCommand(setupSequenceTick, `host_framerate ${framerate}`)
      .addExecCommand(setupSequenceTick, `spec_show_xray ${sequence.showXRay ? 1 : 0}`);

    if (typeof sequence.cfg === 'string') {
      const commands = sequence.cfg.split('\n');
      for (const command of commands) {
        json.addExecCommand(setupSequenceTick, command);
      }
    }

    json.addSkipAhead(1, setupSequenceTick);

    for (const camera of sequence.cameras) {
      json.addSpecPlayer(camera.tick, camera.playerSteamId);
    }

    if (isWindows) {
      const hlaeOutputFolderPath = getHlaeRawFilesFolderPath(rawFilesFolderPath, sequence);
      json
        .addExecCommand(setupSequenceTick, `mirv_streams record name "${hlaeOutputFolderPath}"`)
        .addExecCommand(setupSequenceTick, 'mirv_replace_name filter clear')
        .addExecCommand(sequence.startTick, 'mirv_streams add normal defaultNormal')
        .addExecCommand(sequence.startTick, 'mirv_streams record start')
        .addExecCommand(sequence.endTick, 'mirv_streams record end');

      for (const deathNotice of sequence.deathNotices) {
        const replacePlayerNameCommand = buildReplacePlayerNameCommand(deathNotice);
        json.addExecCommand(setupSequenceTick, replacePlayerNameCommand);

        if (!deathNotice.showKill) {
          json.addExecCommand(
            setupSequenceTick,
            `mirv_deathmsg filter add attackerMatch=x${deathNotice.steamId} block=1`,
          );
        }
        if (deathNotice.highlightKill) {
          json.addExecCommand(
            setupSequenceTick,
            `mirv_deathmsg filter add attackerMatch=x${deathNotice.steamId} attackerIsLocal=1`,
          );
        }
      }
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
