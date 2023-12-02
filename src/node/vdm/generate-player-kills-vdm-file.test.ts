import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Perspective } from 'csdm/common/types/perspective';
import type { PlaybackMatch } from '../database/watch/get-match-playback';
import { generatePlayerKillsVdmFile } from './generate-player-kills-vdm-file';

describe(`Generate player's kills VDM file`, () => {
  it(`should generate a VDM file that focus on player's kills`, async () => {
    const demoPath = fileURLToPath(new URL('player-kills.dem', import.meta.url));
    const fakeKillerSteamId = 'fakeKillerSteamId';
    const fakeVictimSteamId = 'fakeVictimSteamId';
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

    const vdm = await generatePlayerKillsVdmFile({
      match: data,
      steamId: fakeKillerSteamId,
      perspective: Perspective.Player,
      beforeDelaySeconds: 2,
      nextDelaySeconds: 4,
    });

    const vdmContent = await fs.readFile(vdm.getVdmPath(), 'utf8');
    expect(vdmContent).toMatchSnapshot();
  });
});
