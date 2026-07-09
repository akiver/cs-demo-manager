import { describe, expect, it } from 'vite-plus/test';
import { WeaponType } from 'csdm/common/types/counter-strike';
import type { BombDefused } from 'csdm/common/types/bomb-defused';
import type { BombPlanted } from 'csdm/common/types/bomb-planted';
import type { Clutch } from 'csdm/common/types/clutch';
import type { Damage } from 'csdm/common/types/damage';
import type { Kill } from 'csdm/common/types/kill';
import type { Match } from 'csdm/common/types/match';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import type { Round } from 'csdm/common/types/round';
import { buildCumulativeMatchPlayers } from './build-cumulative-match-players';

function createPlayer(steamId: string, overrides: Partial<MatchPlayer> = {}): MatchPlayer {
  return {
    steamId,
    name: steamId,
    killCount: 99,
    deathCount: 99,
    assistCount: 99,
    damageHealth: 99,
    damageArmor: 99,
    averageDamagePerRound: 99,
    averageKillsPerRound: 99,
    averageDeathsPerRound: 99,
    averageUtilityDamagePerRound: 99,
    headshotCount: 99,
    headshotPercentage: 99,
    mvpCount: 7,
    firstKillCount: 99,
    firstDeathCount: 99,
    rankType: 0,
    rank: 0,
    oldRank: 0,
    winsCount: 0,
    vsOneCount: 99,
    vsTwoCount: 99,
    vsThreeCount: 99,
    vsFourCount: 99,
    vsFiveCount: 99,
    vsOneLostCount: 99,
    vsTwoLostCount: 99,
    vsThreeLostCount: 99,
    vsFourLostCount: 99,
    vsFiveLostCount: 99,
    vsOneWonCount: 99,
    vsTwoWonCount: 99,
    vsThreeWonCount: 99,
    vsFourWonCount: 99,
    vsFiveWonCount: 99,
    bombPlantedCount: 99,
    bombDefusedCount: 99,
    killDeathRatio: 99,
    score: 123,
    teamName: 'Team A',
    kast: 99,
    utilityDamage: 99,
    tradeKillCount: 99,
    tradeDeathCount: 99,
    firstTradeKillCount: 99,
    firstTradeDeathCount: 99,
    oneKillCount: 99,
    twoKillCount: 99,
    threeKillCount: 99,
    fourKillCount: 99,
    fiveKillCount: 99,
    collateralKillCount: 99,
    wallbangKillCount: 99,
    noScopeKillCount: 99,
    avatar: null,
    hostageRescuedCount: 4,
    hltvRating: 1.23,
    hltvRating2: 1.34,
    lastBanDate: null,
    crosshairShareCode: null,
    inspectWeaponCount: 5,
    deathWhileInspectingWeaponCount: 6,
    color: 0,
    tagIds: [],
    ...overrides,
  };
}

function createKill(overrides: Partial<Kill>): Kill {
  return {
    roundNumber: 1,
    tick: 1,
    frame: 1,
    killerSteamId: '',
    victimSteamId: '',
    assisterSteamId: '',
    isHeadshot: false,
    penetratedObjects: 0,
    isTradeKill: false,
    isTradeDeath: false,
    isNoScope: false,
    weaponType: WeaponType.Rifle,
    ...overrides,
  } as Kill;
}

function createDamage(overrides: Partial<Damage>): Damage {
  return {
    roundNumber: 1,
    attackerSteamId: '',
    healthDamage: 0,
    armorDamage: 0,
    weaponType: WeaponType.Rifle,
    ...overrides,
  } as Damage;
}

function createMatch(): Match {
  return {
    players: [createPlayer('a'), createPlayer('b'), createPlayer('c'), createPlayer('d')],
    rounds: [{ number: 1 }, { number: 2 }] as Round[],
    kills: [
      createKill({
        roundNumber: 1,
        tick: 10,
        frame: 10,
        killerSteamId: 'a',
        victimSteamId: 'b',
        isHeadshot: true,
        isTradeDeath: true,
        isNoScope: true,
        penetratedObjects: 1,
      }),
      createKill({
        roundNumber: 1,
        tick: 10,
        frame: 11,
        killerSteamId: 'a',
        victimSteamId: 'd',
      }),
      createKill({
        roundNumber: 1,
        tick: 20,
        frame: 20,
        killerSteamId: 'c',
        victimSteamId: 'a',
        isTradeKill: true,
      }),
      createKill({
        roundNumber: 2,
        tick: 5,
        frame: 5,
        killerSteamId: 'b',
        victimSteamId: 'c',
        assisterSteamId: 'a',
      }),
    ],
    damages: [
      createDamage({ roundNumber: 1, attackerSteamId: 'a', healthDamage: 50, armorDamage: 10 }),
      createDamage({
        roundNumber: 1,
        attackerSteamId: 'a',
        healthDamage: 20,
        weaponType: WeaponType.Grenade,
      }),
      createDamage({
        roundNumber: 2,
        attackerSteamId: 'b',
        healthDamage: 30,
        weaponType: WeaponType.Grenade,
      }),
      createDamage({ roundNumber: 2, attackerSteamId: 'a', healthDamage: 40 }),
    ],
    bombsPlanted: [{ roundNumber: 1, planterSteamId: 'a' } as BombPlanted],
    bombsDefused: [{ roundNumber: 2, defuserSteamId: 'b' } as BombDefused],
    clutches: [
      { roundNumber: 1, clutcherSteamId: 'c', opponentCount: 2, won: true } as Clutch,
      { roundNumber: 2, clutcherSteamId: 'b', opponentCount: 1, won: false } as Clutch,
    ],
  } as Match;
}

function getPlayer(players: MatchPlayer[], steamId: string) {
  const player = players.find((player) => player.steamId === steamId);
  if (player === undefined) {
    throw new Error(`Player ${steamId} not found`);
  }

  return player;
}

describe('buildCumulativeMatchPlayers', () => {
  it('returns cumulative full-range values for a simple fixture', () => {
    const players = buildCumulativeMatchPlayers(createMatch(), 2);

    const playerA = getPlayer(players, 'a');
    expect(playerA.killCount).toBe(2);
    expect(playerA.deathCount).toBe(1);
    expect(playerA.assistCount).toBe(1);
    expect(playerA.killDeathRatio).toBe(2);
    expect(playerA.damageHealth).toBe(110);
    expect(playerA.damageArmor).toBe(10);
    expect(playerA.averageDamagePerRound).toBe(55);
    expect(playerA.utilityDamage).toBe(20);
    expect(playerA.averageUtilityDamagePerRound).toBe(10);
    expect(playerA.headshotCount).toBe(1);
    expect(playerA.headshotPercentage).toBe(50);
    expect(playerA.bombPlantedCount).toBe(1);
    expect(playerA.mvpCount).toBe(7);
    expect(playerA.score).toBe(123);
    expect(playerA.hltvRating).toBe(1.23);

    const playerB = getPlayer(players, 'b');
    expect(playerB.killCount).toBe(1);
    expect(playerB.deathCount).toBe(1);
    expect(playerB.bombDefusedCount).toBe(1);
    expect(playerB.vsOneCount).toBe(1);
    expect(playerB.vsOneLostCount).toBe(1);

    const playerC = getPlayer(players, 'c');
    expect(playerC.vsTwoCount).toBe(1);
    expect(playerC.vsTwoWonCount).toBe(1);
  });

  it('excludes events after the selected round', () => {
    const players = buildCumulativeMatchPlayers(createMatch(), 1);

    const playerA = getPlayer(players, 'a');
    expect(playerA.assistCount).toBe(0);
    expect(playerA.damageHealth).toBe(70);
    expect(playerA.averageDamagePerRound).toBe(70);

    const playerB = getPlayer(players, 'b');
    expect(playerB.killCount).toBe(0);
    expect(playerB.bombDefusedCount).toBe(0);

    const playerC = getPlayer(players, 'c');
    expect(playerC.deathCount).toBe(0);
  });

  it('counts first kills and first deaths per included round', () => {
    const players = buildCumulativeMatchPlayers(createMatch(), 2);

    expect(getPlayer(players, 'a').firstKillCount).toBe(1);
    expect(getPlayer(players, 'b').firstDeathCount).toBe(1);
    expect(getPlayer(players, 'b').firstKillCount).toBe(1);
    expect(getPlayer(players, 'c').firstDeathCount).toBe(1);
  });

  it('counts trade, multi-kill, wallbang, no-scope, and collateral kills', () => {
    const players = buildCumulativeMatchPlayers(createMatch(), 2);

    const playerA = getPlayer(players, 'a');
    expect(playerA.twoKillCount).toBe(1);
    expect(playerA.collateralKillCount).toBe(1);
    expect(playerA.wallbangKillCount).toBe(1);
    expect(playerA.noScopeKillCount).toBe(1);

    const playerB = getPlayer(players, 'b');
    expect(playerB.tradeDeathCount).toBe(1);
    expect(playerB.firstTradeDeathCount).toBe(1);

    const playerC = getPlayer(players, 'c');
    expect(playerC.tradeKillCount).toBe(1);
  });

  it('computes KAST from kills, assists, survival, and traded deaths', () => {
    const players = buildCumulativeMatchPlayers(createMatch(), 2);

    expect(getPlayer(players, 'a').kast).toBe(100);
    expect(getPlayer(players, 'b').kast).toBe(100);
    expect(getPlayer(players, 'c').kast).toBe(50);
  });
});
