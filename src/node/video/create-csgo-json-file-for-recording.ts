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
  const json = new JSONActionsFileGenerator(demoPath, Game.CSGO, false);
  const mandatoryCommands = ['sv_cheats 1', 'volume 1'];
  if (isWindows) {
    mandatoryCommands.push('host_timescale 0', 'mirv_snd_timescale 1', 'mirv_gameoverlay enable 0');
  }
  for (const command of mandatoryCommands) {
    json.addExecCommand(0, command);
  }
  if (showOnlyDeathNotices) {
    json.addExecCommand(0, 'cl_draw_only_deathnotices 1');
    json.addExecCommand(0, 'net_graph 0');
  }

  if (isWindows) {
    json.addExecCommand(0, `mirv_deathmsg lifetime ${deathNoticesDuration}`);
  }

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];
    const roundedTickrate = Math.round(tickrate);
    const skipAheadTick = i === 0 ? roundedTickrate : sequences[i - 1].endTick + roundedTickrate;
    const setupSequenceTick = sequence.startTick - roundedTickrate > 0 ? sequence.startTick - roundedTickrate : 1;

    json
      .addSkipAhead(skipAheadTick, setupSequenceTick)
      .addExecCommand(setupSequenceTick, `host_framerate ${framerate}`);

    if (sequence.playerVoicesEnabled) {
      json.enablePlayerVoices(setupSequenceTick);
    } else {
      json.disablePlayerVoices(setupSequenceTick);
    }

    const showXrayCommand = `spec_show_xray ${sequence.showXRay ? 1 : 0}`;
    json.addExecCommand(setupSequenceTick, showXrayCommand);

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

    if (sequence.playerFocusSteamId !== undefined) {
      json.addSpecPlayer(setupSequenceTick, sequence.playerFocusSteamId);
    }

    if (typeof sequence.cfg === 'string') {
      const commands = sequence.cfg.split('\n');
      for (const command of commands) {
        json.addExecCommand(setupSequenceTick, command);
      }
    }
  }

  if (closeGameAfterRecording) {
    json.addExecCommand(sequences[sequences.length - 1].endTick + 1, 'quit');
  }

  await json.write();
}
