import { VDMGenerator } from 'csdm/node/vdm/generator';
import { isWindows } from 'csdm/node/os/is-windows';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';

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
 * Returns a VDM compatible HLAE "mirv_replace_name" command string for a VDM file.
 * It wraps the "mirv_replace_name" command in a "mirv_exec" command in order to work with VDM files.
 * If we don't wrap it, the CSGO client will not be able to parse the VDM file and simply ignore it.
 * As a result the demo will start from the beginning without notice and players' name will not change.
 *
 * mirv_exec doc: https://github.com/advancedfx/advancedfx/wiki/Source%3Amirv_exec
 * mirv_replace_name doc: https://github.com/advancedfx/advancedfx/wiki/Source%3Amirv_replace_name
 */
function buildReplacePlayerNameCommand(deathNotice: DeathNoticesPlayerOptions) {
  return `mirv_exec \\"mirv_replace_name\\" \\"filter\\" \\"add\\" \\"x${
    deathNotice.steamId
  }\\" \\"${deathNotice.playerName.replaceAll('"', '{QUOTE}')}\\"`;
}

export async function createVdmFileForRecording({
  rawFilesFolderPath,
  framerate,
  demoPath,
  sequences,
  closeGameAfterRecording,
  showOnlyDeathNotices,
  deathNoticesDuration,
  tickrate,
}: Options) {
  const vdm = new VDMGenerator(demoPath);
  const mandatoryCommands = ['sv_cheats 1', 'volume 1'];
  if (isWindows) {
    mandatoryCommands.push('host_timescale 0', 'mirv_snd_timescale 1', 'mirv_gameoverlay enable 0');
  }
  for (const command of mandatoryCommands) {
    vdm.addExecCommands(0, command);
  }
  if (showOnlyDeathNotices) {
    vdm.addExecCommands(0, 'cl_draw_only_deathnotices 1');
    vdm.addExecCommands(0, 'net_graph 0');
  }

  if (isWindows) {
    vdm.addExecCommands(0, `mirv_deathmsg lifetime ${deathNoticesDuration}`);
  }

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];
    const roundedTickrate = Math.round(tickrate);
    const skipAheadTick = i === 0 ? roundedTickrate : sequences[i - 1].endTick + roundedTickrate;
    const setupSequenceTick = sequence.startTick - roundedTickrate > 0 ? sequence.startTick - roundedTickrate : 0;

    vdm
      .addSkipAhead(skipAheadTick, setupSequenceTick)
      .addExecCommands(setupSequenceTick, `host_framerate ${framerate}`);

    if (isWindows) {
      const hlaeOutputFolderPath = getHlaeRawFilesFolderPath(rawFilesFolderPath, sequence);
      vdm
        // !! Escaping quotes is required for vdm files!
        .addExecCommands(setupSequenceTick, `mirv_streams record name \\"${hlaeOutputFolderPath}\\"`)
        .addExecCommands(setupSequenceTick, 'mirv_replace_name filter clear')
        .addExecCommands(sequence.startTick, 'mirv_streams add normal defaultNormal; mirv_streams record start')
        .addExecCommands(sequence.endTick, 'mirv_streams record end');

      for (const deathNotice of sequence.deathNotices) {
        const replacePlayerNameCommand = buildReplacePlayerNameCommand(deathNotice);
        vdm.addExecCommands(setupSequenceTick, replacePlayerNameCommand);

        if (!deathNotice.showKill) {
          vdm.addExecCommands(
            setupSequenceTick,
            `mirv_deathmsg filter add attackerMatch=x${deathNotice.steamId} block=1`,
          );
        }
        if (deathNotice.highlightKill) {
          vdm.addExecCommands(
            setupSequenceTick,
            `mirv_deathmsg filter add attackerMatch=x${deathNotice.steamId} attackerIsLocal=1`,
          );
        }
      }
    } else {
      vdm
        .addExecCommands(sequence.startTick, `startmovie ${getSequenceName(sequence)}`)
        .addExecCommands(sequence.endTick, 'endmovie');
    }

    if (sequence.playerFocusSteamId !== undefined) {
      vdm.addSpecPlayer(setupSequenceTick, sequence.playerFocusSteamId);
    }

    if (typeof sequence.cfg === 'string') {
      const commands = sequence.cfg.split('\n');
      for (const command of commands) {
        vdm.addExecCommands(setupSequenceTick, command);
      }
    }
  }

  if (closeGameAfterRecording) {
    vdm.addExecCommands(sequences[sequences.length - 1].endTick + 1, 'quit');
  }

  await vdm.write();
}
