import { WatchType } from 'csdm/common/types/watch-type';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { db } from '../database';

export type Action = {
  tick: number;
  roundNumber: number;
  // We use players slots for CS2 rather than Steam IDs because the command spec_lock_to_accountid doesn't work when the
  // current logged in Steam account is the player that you would like to focus on with non Valve demos.
  // See https://github.com/akiver/cs-demo-manager/issues/775
  // Fields can be null because it may be an action caused by the "world".
  // In such case, the camera will be focused on the focused player whatever the perspective is.
  playerSlot: number | null;
  playerSteamId: string | null;
  opponentSlot: number | null;
  opponentSteamId: string | null;
};

export type PlaybackAction = Action & {
  playerSide: TeamNumber;
};

export type PlaybackMatch = {
  checksum: string;
  demoPath: string;
  tickCount: number;
  tickrate: number;
  actions: Action[];
};

// Two actions of a player further apart than this are played as separate sequences.
export const maxSecondsBetweenPlaybackActions = 15;

// Without a Steam ID, the kills of every player are returned, team kills and suicides left out.
async function fetchKills(checksum: string, type: WatchType, steamId?: string): Promise<PlaybackAction[]> {
  const isHighlights = type === WatchType.Highlights;
  let killsQuery = db
    .selectFrom('kills')
    .select([
      'tick',
      'round_number as roundNumber',
      'killer_steam_id as playerSteamId',
      'victim_steam_id as opponentSteamId',
      isHighlights ? 'killer_side as playerSide' : 'victim_side as playerSide',
    ])
    .leftJoin('players as p1', function (qb) {
      return qb
        .onRef('p1.match_checksum', '=', 'kills.match_checksum')
        .onRef('p1.steam_id', '=', isHighlights ? 'kills.killer_steam_id' : 'kills.victim_steam_id');
    })
    .select(['p1.index as playerSlot'])
    .leftJoin('players as p2', function (qb) {
      return qb
        .onRef('p2.match_checksum', '=', 'kills.match_checksum')
        .onRef('p2.steam_id', '=', isHighlights ? 'kills.victim_steam_id' : 'kills.killer_steam_id');
    })
    .select(['p2.index as opponentSlot'])
    .where('kills.match_checksum', '=', checksum)
    .orderBy('tick', 'asc');

  if (steamId === undefined) {
    killsQuery = killsQuery
      .whereRef('killer_steam_id', '<>', 'victim_steam_id')
      .whereRef('killer_side', '<>', 'victim_side');
  } else if (isHighlights) {
    killsQuery = killsQuery.where('killer_steam_id', '=', steamId).where('victim_steam_id', '<>', steamId);
  } else {
    killsQuery = killsQuery.where('victim_steam_id', '=', steamId).where('killer_steam_id', '<>', steamId);
  }
  const kills = await killsQuery.execute();

  return kills;
}

// Without a Steam ID, the heavy damages of every player are returned, team damages and self damages left out.
async function fetchDamages(checksum: string, type: WatchType, steamId?: string): Promise<PlaybackAction[]> {
  const isHighlights = type === WatchType.Highlights;
  let damagesQuery = db
    .selectFrom('damages')
    .select([
      'tick',
      'round_number as roundNumber',
      'attacker_steam_id as playerSteamId',
      'victim_steam_id as opponentSteamId',
      isHighlights ? 'attacker_side as playerSide' : 'victim_side as playerSide',
    ])
    .leftJoin('players as p1', function (qb) {
      return qb
        .onRef('p1.match_checksum', '=', 'damages.match_checksum')
        .onRef('p1.steam_id', '=', isHighlights ? 'damages.attacker_steam_id' : 'damages.victim_steam_id');
    })
    .select(['p1.index as playerSlot'])
    .leftJoin('players as p2', function (qb) {
      return qb
        .onRef('p2.match_checksum', '=', 'damages.match_checksum')
        .onRef('p2.steam_id', '=', isHighlights ? 'damages.victim_steam_id' : 'damages.attacker_steam_id');
    })
    .select(['p2.index as opponentSlot'])
    .where('damages.match_checksum', '=', checksum)
    .where('health_damage', '>=', 40)
    .where('victim_new_health', '>', 0) // Ignore damage resulting in a kill
    .orderBy('tick', 'asc');

  if (steamId === undefined) {
    damagesQuery = damagesQuery
      .whereRef('attacker_steam_id', '<>', 'victim_steam_id')
      .whereRef('attacker_side', '<>', 'victim_side');
  } else if (isHighlights) {
    damagesQuery = damagesQuery.where('attacker_steam_id', '=', steamId).where('victim_steam_id', '<>', steamId);
  } else {
    damagesQuery = damagesQuery.where('victim_steam_id', '=', steamId).where('attacker_steam_id', '<>', steamId);
  }
  const damages = await damagesQuery.execute();

  return damages;
}

type ActionsOptions = {
  checksum: string;
  type: WatchType;
  includeDamages: boolean;
  // The player whose actions are wanted, every player's without it.
  steamId?: string;
};

export async function fetchPlaybackActions({
  checksum,
  type,
  includeDamages,
  steamId,
}: ActionsOptions): Promise<PlaybackAction[]> {
  if (!includeDamages) {
    return fetchKills(checksum, type, steamId);
  }

  const [kills, damages] = await Promise.all([
    fetchKills(checksum, type, steamId),
    fetchDamages(checksum, type, steamId),
  ]);
  const actions = [...kills, ...damages];
  actions.sort((actionA, actionB) => {
    return actionA.tick - actionB.tick;
  });

  return actions;
}

type Options = {
  demoPath: string;
  steamId: string;
  type: WatchType;
  includeDamages: boolean;
};

export async function getPlaybackMatch({ demoPath, steamId, type, includeDamages }: Options) {
  const checksum = await getDemoChecksumFromDemoPath(demoPath);
  const demo = await db
    .selectFrom('demos')
    .select(['checksum', 'tickrate', 'tick_count as tickCount'])
    .where('checksum', '=', checksum)
    .executeTakeFirst();

  if (!demo) {
    return undefined;
  }

  const actions = await fetchPlaybackActions({ checksum, type, includeDamages, steamId });

  const playbackMatch: PlaybackMatch = {
    checksum: demo.checksum,
    tickrate: demo.tickrate,
    tickCount: demo.tickCount,
    demoPath,
    actions,
  };

  return playbackMatch;
}
