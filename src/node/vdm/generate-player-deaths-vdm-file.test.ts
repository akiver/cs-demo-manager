import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Perspective } from 'csdm/common/types/perspective';
import type { PlaybackMatch } from '../database/watch/get-match-playback';
import { generatePlayerDeathsVdmFile } from './generate-player-deaths-vdm-file';

describe(`Generate player's deaths VDM file`, () => {
  it(`should generate a VDM file that focus on player's deaths`, async () => {
    const demoPath = fileURLToPath(new URL('player-deaths.dem', import.meta.url));
    const fakeVictimSteamId = 'fakeVictimSteamId';
    const fakeKillerSteamId = 'fakeKillerSteamId';
    const data: PlaybackMatch = {
      checksum: 'checksum',
      steamId: '12345',
      demoPath: demoPath,
      tickrate: 1,
      tickCount: 202,
      kills: [
        {
          roundNumber: 1,
          tick: 10,
          victimSteamId: fakeVictimSteamId,
          killerSteamId: fakeKillerSteamId,
        },
        {
          roundNumber: 1,
          tick: 13,
          victimSteamId: fakeVictimSteamId,
          killerSteamId: fakeKillerSteamId,
        },
        {
          roundNumber: 1,
          tick: 50,
          victimSteamId: fakeVictimSteamId,
          killerSteamId: fakeKillerSteamId,
        },
        {
          roundNumber: 2,
          tick: 200,
          victimSteamId: fakeVictimSteamId,
          killerSteamId: fakeKillerSteamId,
        },
      ],
    };

    const vdm = await generatePlayerDeathsVdmFile({
      match: data,
      steamId: fakeVictimSteamId,
      perspective: Perspective.Player,
      beforeDelaySeconds: 2,
      nextDelaySeconds: 4,
    });

    const vdmContent = await fs.readFile(vdm.getVdmPath(), 'utf8');
    expect(vdmContent).toMatchSnapshot();
  });
});
