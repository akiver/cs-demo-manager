import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';

type Options = {
  steamIds: string[];
  filters?: MatchFilters;
  checksums?: string[];
};

type PlayerAverageTimesToDamage = {
  // Milliseconds, null when not available.
  averageTimeToDamage: number | null;
  averageTimeToKill: number | null;
};

// Averages of all the times to damage/kill of the players rather than the average of their per-match averages so that
// each engagement has the same weight whatever the number of engagements in its match.
// The time_to_damage >= 0 and time_to_kill >= 0 conditions match the partial indexes of these columns.
export async function fetchPlayersAverageTimesToDamage({ steamIds, filters, checksums }: Options) {
  const averagesPerSteamId = new Map<string, PlayerAverageTimesToDamage>();
  if (steamIds.length === 0) {
    return averagesPerSteamId;
  }

  const { avg } = db.fn;
  let damagesQuery = db
    .selectFrom('damages')
    .innerJoin('matches', 'matches.checksum', 'damages.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select(['damages.attacker_steam_id as steamId', avg<number>('damages.time_to_damage').as('average')])
    .where('damages.time_to_damage', '>=', 0)
    .where('damages.is_attacker_controlling_bot', '=', false)
    .where((eb) => eb('damages.attacker_steam_id', '=', eb.fn.any(eb.val(steamIds))))
    .groupBy('damages.attacker_steam_id');
  let killsQuery = db
    .selectFrom('kills')
    .innerJoin('matches', 'matches.checksum', 'kills.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select(['kills.killer_steam_id as steamId', avg<number>('kills.time_to_kill').as('average')])
    .where('kills.time_to_kill', '>=', 0)
    .where('kills.is_killer_controlling_bot', '=', false)
    .where((eb) => eb('kills.killer_steam_id', '=', eb.fn.any(eb.val(steamIds))))
    .groupBy('kills.killer_steam_id');
  if (filters) {
    damagesQuery = applyMatchFilters(damagesQuery, filters);
    killsQuery = applyMatchFilters(killsQuery, filters);
  }

  if (checksums && checksums.length > 0) {
    damagesQuery = damagesQuery.where((eb) => eb('damages.match_checksum', '=', eb.fn.any(eb.val(checksums))));
    killsQuery = killsQuery.where((eb) => eb('kills.match_checksum', '=', eb.fn.any(eb.val(checksums))));
  }

  const [damageRows, killRows] = await Promise.all([damagesQuery.execute(), killsQuery.execute()]);

  const getAverages = (steamId: string) => {
    let averages = averagesPerSteamId.get(steamId);
    if (!averages) {
      averages = { averageTimeToDamage: null, averageTimeToKill: null };
      averagesPerSteamId.set(steamId, averages);
    }

    return averages;
  };

  for (const row of damageRows) {
    getAverages(row.steamId).averageTimeToDamage = row.average;
  }
  for (const row of killRows) {
    getAverages(row.steamId).averageTimeToKill = row.average;
  }

  return averagesPerSteamId;
}
