import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import { JSONActionsFileGenerator } from 'csdm/node/counter-strike/json-actions-file/json-actions-file-generator';
import { Game } from 'csdm/common/types/counter-strike';

type Options = {
  framerate: number;
  demoPath: string;
  sequences: Sequence[];
  closeGameAfterRecording: boolean;
  deathNoticesDuration: number;
  tickrate: number;
  playerSlots: Record<string, number>;
};

export async function createCs2JsonActionsFileForRecording({
  framerate,
  demoPath,
  sequences,
  closeGameAfterRecording,
  tickrate,
  playerSlots,
  deathNoticesDuration,
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
  ];

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];

    for (const command of mandatoryCommands) {
      json.addExecCommand(1, command);
    }

    json.addExecCommand(1, `cl_draw_only_deathnotices ${sequence.showOnlyDeathNotices ? 1 : 0}`);
    json.addExecCommand(1, `mirv_deathmsg lifetime ${deathNoticesDuration}`);

    if (sequence.playerVoicesEnabled) {
      json.enablePlayerVoices(1);
    } else {
      json.disablePlayerVoices(1);
    }

    const roundedTickrate = Math.round(tickrate);
    const setupSequenceTick = sequence.startTick - roundedTickrate > 0 ? sequence.startTick - roundedTickrate : 1;

    json
      .addExecCommand(setupSequenceTick, `mirv_deathmsg clear`)
      .addExecCommand(setupSequenceTick, `host_framerate ${framerate}`)
      .addExecCommand(setupSequenceTick, `spec_show_xray ${sequence.showXRay ? 1 : 0}`);

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
      const playerSlot = playerSlots[camera.playerSteamId];
      if (playerSlot) {
        json.addSpecPlayer(camera.tick, playerSlot);
      }
    }

    for (const deathNotice of sequence.deathNotices) {
      json.addExecCommand(
        setupSequenceTick,
        `mirv_deathmsg filter add attackerMatch=x${deathNotice.steamId} "attackerName=${deathNotice.playerName}"`,
      );
      json.addExecCommand(
        setupSequenceTick,
        `mirv_deathmsg filter add assisterMatch=x${deathNotice.steamId} "assisterName=${deathNotice.playerName}"`,
      );
      json.addExecCommand(
        setupSequenceTick,
        `mirv_deathmsg filter add victimMatch=x${deathNotice.steamId} "victimName=${deathNotice.playerName}"`,
      );

      if (!deathNotice.showKill) {
        json.addExecCommand(
          setupSequenceTick,
          `mirv_deathmsg filter add attackerMatch=x${deathNotice.steamId} block=1`,
        );
      } else if (deathNotice.highlightKill) {
        json.addExecCommand(
          setupSequenceTick,
          `mirv_deathmsg filter add attackerMatch=x${deathNotice.steamId} attackerIsLocal=1`,
        );
      }
    }

    json
      .addExecCommand(sequence.startTick, `startmovie ${getSequenceName(sequence)}`)
      .addExecCommand(sequence.endTick, 'endmovie');

    if (closeGameAfterRecording && i === sequences.length - 1) {
      json.addExecCommand(sequences[sequences.length - 1].endTick + 64, 'quit');
    } else {
      json.addGoToNextSequence(sequence.endTick + 64);
    }
  }

  await json.write();
}
