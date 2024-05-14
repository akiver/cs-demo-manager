import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import { JSONActionsFileGenerator } from 'csdm/node/counter-strike/json-actions-file/json-actions-file-generator';

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

export async function createJsonActionsFileForRecording({
  framerate,
  demoPath,
  sequences,
  closeGameAfterRecording,
  showOnlyDeathNotices,
  tickrate,
}: Options) {
  const json = new JSONActionsFileGenerator(demoPath);
  const mandatoryCommands = [
    'sv_cheats 1',
    'volume 1',
    'cl_hud_telemetry_frametime_show 0',
    'cl_hud_telemetry_net_misdelivery_show 0',
    'cl_hud_telemetry_ping_show 0',
    'cl_hud_telemetry_serverrecvmargin_graph_show 0',
    'r_show_build_info 0',
  ];
  for (const command of mandatoryCommands) {
    json.addExecCommand(1, command);
  }
  if (showOnlyDeathNotices) {
    json.addExecCommand(1, 'cl_draw_only_deathnotices 1');
  }

  // Pause the playback for a few seconds to avoid seeing the loading screen.
  json.addPausePlayback(1);

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];
    const roundedTickrate = Math.round(tickrate);
    const skipAheadTick = i === 0 ? 1 : sequences[i - 1].endTick + roundedTickrate;
    const setupSequenceTick = sequence.startTick - roundedTickrate > 0 ? sequence.startTick - roundedTickrate : 1;

    json
      .addSkipAhead(skipAheadTick, setupSequenceTick)
      .addExecCommand(setupSequenceTick, `host_framerate ${framerate}`);

    const showXrayCommand = `spec_show_xray ${sequence.showXRay ? 1 : 0}`;
    json.addExecCommand(setupSequenceTick, showXrayCommand);

    json
      .addExecCommand(sequence.startTick, `startmovie ${getSequenceName(sequence)}`)
      .addExecCommand(sequence.endTick, 'endmovie');

    if (sequence.playerFocusSteamId) {
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
