import { describe, it, expect } from 'vite-plus/test';
import type { Kill } from 'csdm/common/types/kill';
import type { Match } from 'csdm/common/types/match';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import type { Round } from 'csdm/common/types/round';
import { buildPlayersRoundsSequences } from './build-players-rounds-sequences';
import { defaultSettings } from 'csdm/node/settings/default-settings';

const playerSteamId = 'player-steamId';
const player = {
  steamId: playerSteamId,
  name: 'Player name',
} as MatchPlayer;
const teammateSteamId = 'teammate-steamId';
const teammate = {
  steamId: teammateSteamId,
  name: 'Teammate name',
} as MatchPlayer;

const rounds = [
  {
    number: 1,
    freezetimeEndTick: 100,
    endTick: 1000,
  },
  {
    number: 2,
    freezetimeEndTick: 1200,
    endTick: 2000,
  },
] as Round[];

const match = {
  demoFilePath: '/demo/path',
  tickrate: 10, // Set the demo's tickrate to 10 for easier debugging
  tickCount: 100_000,
  players: [player, teammate],
  rounds,
  kills: [
    {
      roundNumber: 2,
      victimSteamId: playerSteamId,
      killerSteamId: teammateSteamId,
      tick: 1500,
    },
  ] as Kill[],
} as Match;

const options = {
  match,
  steamIds: [playerSteamId],
  rounds: [],
  startSecondsBeforeEvent: 2,
  endSecondsAfterEvent: 3,
  settings: defaultSettings.video,
  firstSequenceNumber: 1,
};

describe('generate player rounds sequences', () => {
  it('should generate 1 sequence per round that ends at the round end or when the player dies', () => {
    const sequences = buildPlayersRoundsSequences(options);

    expect(sequences.length).toBe(2);
    expect(sequences[0].number).toBe(1);
    expect(sequences[0].startTick).toBe(80);
    expect(sequences[0].endTick).toBe(1030);
    expect(sequences[0].playerCameras).toEqual([{ tick: 80, playerSteamId: playerSteamId, playerName: player.name }]);
    expect(sequences[1].number).toBe(2);
    expect(sequences[1].startTick).toBe(1180);
    expect(sequences[1].endTick).toBe(1530);
  });

  it('should only generate sequences for the selected rounds', () => {
    const sequences = buildPlayersRoundsSequences({ ...options, rounds: [2] });

    expect(sequences.length).toBe(1);
    expect(sequences[0].startTick).toBe(1180);
  });

  it('should highlight the kills of the selected players only', () => {
    const [sequence] = buildPlayersRoundsSequences(options);

    expect(sequence.playersOptions.find((options) => options.steamId === playerSteamId)?.highlightKill).toBe(true);
    expect(sequence.playersOptions.find((options) => options.steamId === teammateSteamId)?.highlightKill).toBe(false);
  });

  it('should enable all voices when the setting is enabled and no voice steam ids are provided', () => {
    const [sequence] = buildPlayersRoundsSequences({
      ...options,
      settings: { ...defaultSettings.video, playerVoicesEnabled: true },
    });

    expect(sequence.playerVoicesEnabled).toBe(true);
    expect(sequence.playersOptions.map((options) => options.isVoiceEnabled)).toEqual([true, true]);
  });

  it('should enable only the voices of the provided steam ids', () => {
    const [sequence] = buildPlayersRoundsSequences({
      ...options,
      settings: { ...defaultSettings.video, playerVoicesEnabled: true },
      voiceSteamIds: [teammateSteamId],
    });

    expect(sequence.playerVoicesEnabled).toBe(true);
    expect(sequence.playersOptions.find((options) => options.steamId === playerSteamId)?.isVoiceEnabled).toBe(false);
    expect(sequence.playersOptions.find((options) => options.steamId === teammateSteamId)?.isVoiceEnabled).toBe(true);
  });

  it('should disable voices when the provided steam ids are empty even if the setting is enabled', () => {
    const [sequence] = buildPlayersRoundsSequences({
      ...options,
      settings: { ...defaultSettings.video, playerVoicesEnabled: true },
      voiceSteamIds: [],
    });

    expect(sequence.playerVoicesEnabled).toBe(false);
    expect(sequence.playersOptions.map((options) => options.isVoiceEnabled)).toEqual([false, false]);
  });
});
