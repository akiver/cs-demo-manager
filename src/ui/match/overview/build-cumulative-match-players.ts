import { roundNumber } from 'csdm/common/math/round-number';
import { WeaponType } from 'csdm/common/types/counter-strike';
import type { Kill } from 'csdm/common/types/kill';
import type { Match } from 'csdm/common/types/match';
import type { MatchPlayer } from 'csdm/common/types/match-player';

type MutableMatchPlayer = MatchPlayer;

function getRoundPlayerKey(roundNumber: number, steamId: string) {
  return `${roundNumber}-${steamId}`;
}

function isEarlierKill(kill: Kill, otherKill: Kill) {
  if (kill.tick !== otherKill.tick) {
    return kill.tick < otherKill.tick;
  }

  return kill.frame < otherKill.frame;
}

function divideOrZero(dividend: number, divisor: number, places: number) {
  if (divisor === 0) {
    return dividend === 0 ? 0 : dividend;
  }

  return roundNumber(dividend / divisor, places);
}

function isWeaponEligibleForCollateralKill(weaponType: WeaponType) {
  switch (weaponType) {
    case WeaponType.Equipment:
    case WeaponType.Grenade:
    case WeaponType.Unknown:
    case WeaponType.World:
      return false;
    default:
      return true;
  }
}

function createCumulativePlayer(player: MatchPlayer): MutableMatchPlayer {
  return {
    ...player,
    killCount: 0,
    deathCount: 0,
    assistCount: 0,
    damageHealth: 0,
    damageArmor: 0,
    averageDamagePerRound: 0,
    averageKillsPerRound: 0,
    averageDeathsPerRound: 0,
    averageUtilityDamagePerRound: 0,
    headshotCount: 0,
    headshotPercentage: 0,
    firstKillCount: 0,
    firstDeathCount: 0,
    vsOneCount: 0,
    vsTwoCount: 0,
    vsThreeCount: 0,
    vsFourCount: 0,
    vsFiveCount: 0,
    vsOneLostCount: 0,
    vsTwoLostCount: 0,
    vsThreeLostCount: 0,
    vsFourLostCount: 0,
    vsFiveLostCount: 0,
    vsOneWonCount: 0,
    vsTwoWonCount: 0,
    vsThreeWonCount: 0,
    vsFourWonCount: 0,
    vsFiveWonCount: 0,
    bombPlantedCount: 0,
    bombDefusedCount: 0,
    killDeathRatio: 0,
    kast: 0,
    utilityDamage: 0,
    tradeKillCount: 0,
    tradeDeathCount: 0,
    firstTradeKillCount: 0,
    firstTradeDeathCount: 0,
    oneKillCount: 0,
    twoKillCount: 0,
    threeKillCount: 0,
    fourKillCount: 0,
    fiveKillCount: 0,
    collateralKillCount: 0,
    wallbangKillCount: 0,
    noScopeKillCount: 0,
  };
}

function incrementClutchCount(player: MutableMatchPlayer, opponentCount: number, won: boolean) {
  switch (opponentCount) {
    case 1:
      player.vsOneCount++;
      if (won) {
        player.vsOneWonCount++;
      } else {
        player.vsOneLostCount++;
      }
      break;
    case 2:
      player.vsTwoCount++;
      if (won) {
        player.vsTwoWonCount++;
      } else {
        player.vsTwoLostCount++;
      }
      break;
    case 3:
      player.vsThreeCount++;
      if (won) {
        player.vsThreeWonCount++;
      } else {
        player.vsThreeLostCount++;
      }
      break;
    case 4:
      player.vsFourCount++;
      if (won) {
        player.vsFourWonCount++;
      } else {
        player.vsFourLostCount++;
      }
      break;
    case 5:
      player.vsFiveCount++;
      if (won) {
        player.vsFiveWonCount++;
      } else {
        player.vsFiveLostCount++;
      }
      break;
  }
}

function incrementMultiKillCount(player: MutableMatchPlayer, killCount: number) {
  switch (killCount) {
    case 1:
      player.oneKillCount++;
      break;
    case 2:
      player.twoKillCount++;
      break;
    case 3:
      player.threeKillCount++;
      break;
    case 4:
      player.fourKillCount++;
      break;
    default:
      if (killCount >= 5) {
        player.fiveKillCount++;
      }
  }
}

export function buildCumulativeMatchPlayers(match: Match, selectedRoundNumber: number): MatchPlayer[] {
  const includedRoundNumbers = new Set(
    match.rounds.filter((round) => round.number <= selectedRoundNumber).map((round) => round.number),
  );
  const includedRoundCount = includedRoundNumbers.size;
  const players = match.players.map(createCumulativePlayer);
  const playerBySteamId = new Map(players.map((player) => [player.steamId, player]));
  const firstKillByRoundNumber = new Map<number, Kill>();
  const killCountByRoundAndKiller = new Map<string, number>();
  const collateralKillCountByTickAndKiller = new Map<string, number>();
  const hadKill = new Set<string>();
  const hadAssist = new Set<string>();
  const hadDeath = new Set<string>();
  const wasTraded = new Set<string>();

  for (const kill of match.kills) {
    if (!includedRoundNumbers.has(kill.roundNumber)) {
      continue;
    }

    const currentFirstKill = firstKillByRoundNumber.get(kill.roundNumber);
    if (currentFirstKill === undefined || isEarlierKill(kill, currentFirstKill)) {
      firstKillByRoundNumber.set(kill.roundNumber, kill);
    }

    const killer = playerBySteamId.get(kill.killerSteamId);
    if (killer !== undefined) {
      killer.killCount++;
      killer.headshotCount += kill.isHeadshot ? 1 : 0;
      killer.tradeKillCount += kill.isTradeKill ? 1 : 0;
      killer.wallbangKillCount += kill.penetratedObjects > 0 ? 1 : 0;
      killer.noScopeKillCount += kill.isNoScope ? 1 : 0;
      hadKill.add(getRoundPlayerKey(kill.roundNumber, killer.steamId));

      const killCountKey = getRoundPlayerKey(kill.roundNumber, killer.steamId);
      killCountByRoundAndKiller.set(killCountKey, (killCountByRoundAndKiller.get(killCountKey) ?? 0) + 1);

      if (isWeaponEligibleForCollateralKill(kill.weaponType)) {
        const collateralKillKey = `${kill.tick}-${killer.steamId}`;
        collateralKillCountByTickAndKiller.set(
          collateralKillKey,
          (collateralKillCountByTickAndKiller.get(collateralKillKey) ?? 0) + 1,
        );
      }
    }

    const victim = playerBySteamId.get(kill.victimSteamId);
    if (victim !== undefined) {
      victim.deathCount++;
      victim.tradeDeathCount += kill.isTradeDeath ? 1 : 0;
      hadDeath.add(getRoundPlayerKey(kill.roundNumber, victim.steamId));
      if (kill.isTradeDeath) {
        wasTraded.add(getRoundPlayerKey(kill.roundNumber, victim.steamId));
      }
    }

    const assister = playerBySteamId.get(kill.assisterSteamId);
    if (assister !== undefined) {
      assister.assistCount++;
      hadAssist.add(getRoundPlayerKey(kill.roundNumber, assister.steamId));
    }
  }

  for (const firstKill of firstKillByRoundNumber.values()) {
    const killer = playerBySteamId.get(firstKill.killerSteamId);
    if (killer !== undefined) {
      killer.firstKillCount++;
      killer.firstTradeKillCount += firstKill.isTradeKill ? 1 : 0;
    }

    const victim = playerBySteamId.get(firstKill.victimSteamId);
    if (victim !== undefined) {
      victim.firstDeathCount++;
      victim.firstTradeDeathCount += firstKill.isTradeDeath ? 1 : 0;
    }
  }

  for (const [roundKillerKey, killCount] of killCountByRoundAndKiller) {
    const steamId = roundKillerKey.slice(roundKillerKey.indexOf('-') + 1);
    const player = playerBySteamId.get(steamId);
    if (player !== undefined) {
      incrementMultiKillCount(player, killCount);
    }
  }

  for (const [tickKillerKey, killCount] of collateralKillCountByTickAndKiller) {
    if (killCount <= 1) {
      continue;
    }

    const steamId = tickKillerKey.slice(tickKillerKey.indexOf('-') + 1);
    const player = playerBySteamId.get(steamId);
    if (player !== undefined) {
      player.collateralKillCount++;
    }
  }

  for (const damage of match.damages) {
    if (!includedRoundNumbers.has(damage.roundNumber)) {
      continue;
    }

    const attacker = playerBySteamId.get(damage.attackerSteamId);
    if (attacker === undefined) {
      continue;
    }

    attacker.damageHealth += damage.healthDamage;
    attacker.damageArmor += damage.armorDamage;
    if (damage.weaponType === WeaponType.Grenade) {
      attacker.utilityDamage += damage.healthDamage;
    }
  }

  for (const bombPlanted of match.bombsPlanted) {
    if (!includedRoundNumbers.has(bombPlanted.roundNumber)) {
      continue;
    }

    const planter = playerBySteamId.get(bombPlanted.planterSteamId);
    if (planter !== undefined) {
      planter.bombPlantedCount++;
    }
  }

  for (const bombDefused of match.bombsDefused) {
    if (!includedRoundNumbers.has(bombDefused.roundNumber)) {
      continue;
    }

    const defuser = playerBySteamId.get(bombDefused.defuserSteamId);
    if (defuser !== undefined) {
      defuser.bombDefusedCount++;
    }
  }

  for (const clutch of match.clutches) {
    if (!includedRoundNumbers.has(clutch.roundNumber)) {
      continue;
    }

    const clutcher = playerBySteamId.get(clutch.clutcherSteamId);
    if (clutcher !== undefined) {
      incrementClutchCount(clutcher, clutch.opponentCount, clutch.won);
    }
  }

  for (const player of players) {
    player.killDeathRatio = divideOrZero(player.killCount, player.deathCount, 1);
    player.averageDamagePerRound = divideOrZero(player.damageHealth, includedRoundCount, 1);
    player.averageKillsPerRound = divideOrZero(player.killCount, includedRoundCount, 1);
    player.averageDeathsPerRound = divideOrZero(player.deathCount, includedRoundCount, 1);
    player.averageUtilityDamagePerRound = divideOrZero(player.utilityDamage, includedRoundCount, 1);
    player.headshotPercentage =
      player.killCount === 0 ? 0 : roundNumber((player.headshotCount / player.killCount) * 100, 1);

    let successfulRoundCount = 0;
    for (const roundNumber of includedRoundNumbers) {
      const roundPlayerKey = getRoundPlayerKey(roundNumber, player.steamId);
      const survived = !hadDeath.has(roundPlayerKey);
      if (hadKill.has(roundPlayerKey) || hadAssist.has(roundPlayerKey) || survived || wasTraded.has(roundPlayerKey)) {
        successfulRoundCount++;
      }
    }
    player.kast = divideOrZero(successfulRoundCount * 100, includedRoundCount, 1);
  }

  return players;
}
