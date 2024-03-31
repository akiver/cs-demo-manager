import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { generatePlayerRoundsVdmFile } from './generate-player-rounds-vdm-file';
import type { Round } from '../counter-strike/launcher/watch-player-rounds';

describe(`Generate player's rounds VDM file`, () => {
  it(`should generate a VDM file that to watch player's rounds`, async () => {
    const demoPath = fileURLToPath(new URL('player-rounds.dem', import.meta.url));
    const fakePlayerSteamId = 'fakeKillerSteamId';
    const rounds: Round[] = [
      {
        number: 1,
        freezeTimeEndTick: 1000,
        tickEnd: 5480,
        deathTick: null,
      },
      {
        number: 2,
        freezeTimeEndTick: 10880,
        tickEnd: 14680,
        deathTick: 12800,
      },
      {
        number: 3,
        freezeTimeEndTick: 16280,
        tickEnd: 19880,
        deathTick: 18600,
      },
      {
        number: 4,
        freezeTimeEndTick: 21480,
        tickEnd: 24680,
        deathTick: null,
      },
    ];

    const vdm = await generatePlayerRoundsVdmFile({
      tickrate: 64,
      demoPath,
      rounds,
      steamId: fakePlayerSteamId,
      beforeDelaySeconds: 2,
      afterDelaySeconds: 6,
    });

    const vdmContent = await fs.readFile(vdm.getVdmPath(), 'utf8');
    expect(vdmContent).toMatchSnapshot();
  });
});
