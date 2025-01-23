import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Perspective } from 'csdm/common/types/perspective';
import type { PlaybackMatch } from '../../database/watch/get-match-playback';
import { generatePlayerLowlightsJsonFile } from './generate-player-lowlights-json-file';
import { Game } from 'csdm/common/types/counter-strike';

describe(`Generate player's lowlights JSON file`, () => {
  it(`CSGO`, async () => {
    const demoPath = fileURLToPath(new URL('output/csgo-player-lowlights.dem', import.meta.url));
    const fakePlayerSteamId = 'fakePlayerSteamId';
    const fakeOpponentSteamId = 'fakeOpponentSteamId';
    const data: PlaybackMatch = {
      checksum: 'checksum',
      demoPath: demoPath,
      tickrate: 64,
      tickCount: 32000,
      actions: [
        {
          roundNumber: 1,
          tick: 1000,
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 1,
          tick: 1400,
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 1,
          tick: 2000,
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
        {
          roundNumber: 2,
          tick: 5000,
          opponentSteamId: fakeOpponentSteamId,
          playerSteamId: fakePlayerSteamId,
          playerSlot: null,
          opponentSlot: null,
        },
      ],
    };

    await generatePlayerLowlightsJsonFile({
      game: Game.CSGO,
      actions: data.actions,
      demoPath: data.demoPath,
      tickCount: data.tickCount,
      tickrate: data.tickrate,
      perspective: Perspective.Player,
      beforeDelaySeconds: 2,
      nextDelaySeconds: 4,
      playerVoicesEnabled: true,
      players: [],
    });

    const content = await fs.readFile(`${demoPath}.json`, 'utf8');
    expect(content).toMatchSnapshot();
  });

  it(`CS2`, async () => {
    const demoPath = fileURLToPath(new URL('output/cs2-player-lowlights.dem', import.meta.url));
    const fakePlayerSlot = 4;
    const fakeOpponentPlayerSlot = 8;
    const data: PlaybackMatch = {
      checksum: 'checksum',
      demoPath: demoPath,
      tickrate: 64,
      tickCount: 32000,
      actions: [
        {
          roundNumber: 1,
          tick: 1000,
          opponentSteamId: null,
          playerSteamId: null,
          playerSlot: fakePlayerSlot,
          opponentSlot: fakeOpponentPlayerSlot,
        },
        {
          roundNumber: 1,
          tick: 1400,
          opponentSteamId: null,
          playerSteamId: null,
          playerSlot: fakePlayerSlot,
          opponentSlot: fakeOpponentPlayerSlot,
        },
        {
          roundNumber: 1,
          tick: 2000,
          opponentSteamId: null,
          playerSteamId: null,
          playerSlot: fakePlayerSlot,
          opponentSlot: fakeOpponentPlayerSlot,
        },
        {
          roundNumber: 2,
          tick: 5000,
          opponentSteamId: null,
          playerSteamId: null,
          playerSlot: fakePlayerSlot,
          opponentSlot: fakeOpponentPlayerSlot,
        },
      ],
    };

    await generatePlayerLowlightsJsonFile({
      game: Game.CS2,
      actions: data.actions,
      demoPath: data.demoPath,
      tickCount: data.tickCount,
      tickrate: data.tickrate,
      perspective: Perspective.Player,
      beforeDelaySeconds: 2,
      nextDelaySeconds: 4,
      playerVoicesEnabled: true,
      players: [],
    });

    const content = await fs.readFile(`${demoPath}.json`, 'utf8');
    expect(content).toMatchSnapshot();
  });
});
