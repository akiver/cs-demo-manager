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
        freezeTimeEndTick: 10,
        tickEnd: 90,
      },
      {
        number: 2,
        freezeTimeEndTick: 110,
        tickEnd: 190,
      },
      {
        number: 3,
        freezeTimeEndTick: 210,
        tickEnd: 290,
      },
      {
        number: 4,
        freezeTimeEndTick: 310,
        tickEnd: 390,
      },
    ];

    const vdm = await generatePlayerRoundsVdmFile({
      demoPath,
      rounds,
      steamId: fakePlayerSteamId,
    });

    const vdmContent = await fs.readFile(vdm.getVdmPath(), 'utf8');
    expect(vdmContent).toMatchSnapshot();
  });
});
