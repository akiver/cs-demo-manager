import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import type { Round } from '../launcher/watch-player-rounds';
import { generatePlayerRoundsJsonFile } from './generate-player-rounds-json-file';
import { Game } from 'csdm/common/types/counter-strike';

describe(`Generate player's rounds JSON file`, () => {
  it(`CSGO`, async () => {
    const demoPath = fileURLToPath(new URL('output/csgo-player-rounds.dem', import.meta.url));
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

    await generatePlayerRoundsJsonFile({
      tickrate: 64,
      demoPath,
      rounds,
      playerId: fakePlayerSteamId,
      beforeDelaySeconds: 2,
      afterDelaySeconds: 6,
      game: Game.CSGO,
      playerVoicesEnabled: true,
      players: [],
    });

    const content = await fs.readFile(`${demoPath}.json`, 'utf8');
    expect(content).toMatchSnapshot();
  });

  it(`CS2`, async () => {
    const demoPath = fileURLToPath(new URL('output/cs2-player-rounds.dem', import.meta.url));
    const fakePlayerSlot = 4;
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

    await generatePlayerRoundsJsonFile({
      tickrate: 64,
      demoPath,
      rounds,
      playerId: fakePlayerSlot,
      beforeDelaySeconds: 2,
      afterDelaySeconds: 6,
      game: Game.CS2,
      playerVoicesEnabled: true,
      players: [],
    });

    const content = await fs.readFile(`${demoPath}.json`, 'utf8');
    expect(content).toMatchSnapshot();
  });
});
