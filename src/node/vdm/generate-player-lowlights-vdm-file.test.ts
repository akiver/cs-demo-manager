import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Perspective } from 'csdm/common/types/perspective';
import type { PlaybackMatch } from '../database/watch/get-match-playback';
import { generatePlayerLowlightsVdmFile } from './generate-player-lowlights-vdm-file';

describe(`Generate player's lowlights VDM file`, () => {
  it(`should generate a VDM file that focus on player's lowlights`, async () => {
    const demoPath = fileURLToPath(new URL('player-lowlights.dem', import.meta.url));
    const fakePlayerSteamId = 'fakePlayerSteamId';
    const fakeOpponentSteamId = 'fakeOpponentSteamId';
    const data: PlaybackMatch = {
      checksum: 'checksum',
      demoPath: demoPath,
      tickrate: 1,
      tickCount: 202,
      actions: [
        {
          roundNumber: 1,
          tick: 10,
          opponentSteamId: fakePlayerSteamId,
          playerSteamId: fakeOpponentSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 1,
          tick: 13,
          opponentSteamId: fakePlayerSteamId,
          playerSteamId: fakeOpponentSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 1,
          tick: 50,
          opponentSteamId: fakePlayerSteamId,
          playerSteamId: fakeOpponentSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 2,
          tick: 200,
          opponentSteamId: fakePlayerSteamId,
          playerSteamId: fakeOpponentSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
      ],
    };

    const vdm = await generatePlayerLowlightsVdmFile({
      actions: data.actions,
      demoPath: data.demoPath,
      tickCount: data.tickCount,
      tickrate: data.tickrate,
      perspective: Perspective.Player,
      beforeDelaySeconds: 2,
      nextDelaySeconds: 4,
    });

    const vdmContent = await fs.readFile(vdm.getVdmPath(), 'utf8');
    expect(vdmContent).toMatchSnapshot();
  });
});
