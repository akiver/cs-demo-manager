import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Perspective } from 'csdm/common/types/perspective';
import type { PlaybackMatch } from '../database/watch/get-match-playback';
import { generatePlayerHighlightsVdmFile } from './generate-player-highlights-vdm-file';

describe(`Generate player's highlights VDM file`, () => {
  it(`should generate a VDM file that focus on player's highlights`, async () => {
    const demoPath = fileURLToPath(new URL('player-highlights.dem', import.meta.url));
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
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 1,
          tick: 13,
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 1,
          tick: 50,
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 2,
          tick: 200,
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
      ],
    };

    const vdm = await generatePlayerHighlightsVdmFile({
      actions: data.actions,
      demoPath,
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
