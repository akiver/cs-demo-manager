import { describe, it, expect } from 'vite-plus/test';
import { GrenadeName } from 'csdm/common/types/counter-strike';
import type { GrenadeBuy } from 'csdm/common/types/grenade-buy';
import type { Shot } from 'csdm/common/types/shot';
import { getGrenadeBuyStats } from './get-grenade-buy-stats';

const playerSteamId = '1';
const teammateSteamId = '2';

function makeBuy(weaponName: GrenadeName, weaponUniqueId: string, steamId = playerSteamId): GrenadeBuy {
  return { playerSteamId: steamId, weaponName, weaponUniqueId };
}

function makeShot(weaponName: GrenadeName, weaponId: string, steamId = playerSteamId) {
  return { playerSteamId: steamId, weaponName, weaponId } as Shot;
}

describe('getGrenadeBuyStats', () => {
  it('should count the bought grenades that have been thrown', () => {
    const buys = [makeBuy(GrenadeName.Smoke, 'a'), makeBuy(GrenadeName.Smoke, 'b'), makeBuy(GrenadeName.Smoke, 'c')];
    const shots = [makeShot(GrenadeName.Smoke, 'a'), makeShot(GrenadeName.Smoke, 'c')];

    expect(getGrenadeBuyStats(buys, shots, playerSteamId, [GrenadeName.Smoke])).toEqual({
      boughtCount: 3,
      usedCount: 2,
    });
  });

  it('should ignore the buys of other players and other grenades', () => {
    const buys = [makeBuy(GrenadeName.Smoke, 'a', teammateSteamId), makeBuy(GrenadeName.HE, 'b')];
    const shots = [makeShot(GrenadeName.Smoke, 'a', teammateSteamId), makeShot(GrenadeName.HE, 'b')];

    expect(getGrenadeBuyStats(buys, shots, playerSteamId, [GrenadeName.Smoke])).toEqual({
      boughtCount: 0,
      usedCount: 0,
    });
  });

  it('should not count thrown grenades that have not been bought by the player', () => {
    const buys = [makeBuy(GrenadeName.HE, 'a')];
    const shots = [makeShot(GrenadeName.HE, 'picked-up'), makeShot(GrenadeName.HE, 'from-previous-round')];

    expect(getGrenadeBuyStats(buys, shots, playerSteamId, [GrenadeName.HE])).toEqual({
      boughtCount: 1,
      usedCount: 0,
    });
  });

  it('should count a bought grenade thrown by a teammate', () => {
    const buys = [makeBuy(GrenadeName.Flashbang, 'a')];
    const shots = [makeShot(GrenadeName.Flashbang, 'a', teammateSteamId)];

    expect(getGrenadeBuyStats(buys, shots, playerSteamId, [GrenadeName.Flashbang])).toEqual({
      boughtCount: 1,
      usedCount: 1,
    });
  });

  it('should cap the throws sharing a weapon ID to the number of buys with this ID', () => {
    const buys = [
      makeBuy(GrenadeName.Flashbang, 'a'),
      makeBuy(GrenadeName.Flashbang, 'b'),
      makeBuy(GrenadeName.Flashbang, 'b'),
    ];
    const shots = [
      makeShot(GrenadeName.Flashbang, 'a'),
      makeShot(GrenadeName.Flashbang, 'a'),
      makeShot(GrenadeName.Flashbang, 'b'),
    ];

    expect(getGrenadeBuyStats(buys, shots, playerSteamId, [GrenadeName.Flashbang])).toEqual({
      boughtCount: 3,
      usedCount: 2,
    });
  });

  it('should combine several grenade names', () => {
    const buys = [makeBuy(GrenadeName.Molotov, 'a'), makeBuy(GrenadeName.Incendiary, 'b')];
    const shots = [makeShot(GrenadeName.Incendiary, 'b')];

    expect(getGrenadeBuyStats(buys, shots, playerSteamId, [GrenadeName.Molotov, GrenadeName.Incendiary])).toEqual({
      boughtCount: 2,
      usedCount: 1,
    });
  });
});
