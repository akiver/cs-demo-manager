import type { WeaponName } from 'csdm/common/types/counter-strike';
import type { GrenadeBuy } from 'csdm/common/types/grenade-buy';
import type { Shot } from 'csdm/common/types/shot';

type GrenadeBuyStats = {
  boughtCount: number;
  usedCount: number;
};

// A bought grenade is "used" when a throw has the same weapon unique ID, whoever threw it.
// Several grenades of the same type may share one weapon entity (e.g. 2 flashbangs), so we count the throws per ID
// and cap them to the number of buys with that ID.
export function getGrenadeBuyStats(
  buys: GrenadeBuy[],
  shots: Shot[],
  playerSteamId: string,
  weaponNames: WeaponName[],
): GrenadeBuyStats {
  const buyCountPerId = new Map<string, number>();
  for (const buy of buys) {
    if (buy.playerSteamId === playerSteamId && weaponNames.includes(buy.weaponName)) {
      buyCountPerId.set(buy.weaponUniqueId, (buyCountPerId.get(buy.weaponUniqueId) ?? 0) + 1);
    }
  }

  const throwCountPerId = new Map<string, number>();
  for (const shot of shots) {
    if (buyCountPerId.has(shot.weaponId) && weaponNames.includes(shot.weaponName)) {
      throwCountPerId.set(shot.weaponId, (throwCountPerId.get(shot.weaponId) ?? 0) + 1);
    }
  }

  let boughtCount = 0;
  let usedCount = 0;
  for (const [weaponId, buyCount] of buyCountPerId) {
    boughtCount += buyCount;
    usedCount += Math.min(buyCount, throwCountPerId.get(weaponId) ?? 0);
  }

  return { boughtCount, usedCount };
}
