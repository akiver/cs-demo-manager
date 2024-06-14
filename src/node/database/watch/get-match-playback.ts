import { WatchType } from 'csdm/common/types/watch-type';
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

export type PlaybackMatch = {
  checksum: string;
  demoPath: string;
  tickCount: number;
  tickrate: number;
  actions: Action[];
};

async function fetchKills(checksum: string, steamId: string, type: WatchType): Promise<Action[]> {
  let killsQuery = db
    .selectFrom('kills')
    .select([
      'tick',
      'round_number as roundNumber',
      'killer_steam_id as playerSteamId',
      'victim_steam_id as opponentSteamId',
    ])
    .leftJoin('players as p1', function (qb) {
      return qb
        .onRef('p1.match_checksum', '=', 'kills.match_checksum')
        .onRef('p1.steam_id', '=', type === WatchType.Highlights ? 'kills.killer_steam_id' : 'kills.victim_steam_id');
    })
    .select(['p1.index as playerSlot'])
    .leftJoin('players as p2', function (qb) {
      return qb
        .onRef('p2.match_checksum', '=', 'kills.match_checksum')
        .onRef('p2.steam_id', '=', type === WatchType.Highlights ? 'kills.victim_steam_id' : 'kills.killer_steam_id');
    })
    .select(['p2.index as opponentSlot'])
    .where('kills.match_checksum', '=', checksum)
    .orderBy('tick', 'asc');

  if (type === WatchType.Highlights) {
    killsQuery = killsQuery.where('killer_steam_id', '=', steamId).where('victim_steam_id', '<>', steamId);
  } else {
    killsQuery = killsQuery.where('victim_steam_id', '=', steamId).where('killer_steam_id', '<>', steamId);
  }
  const kills = await killsQuery.execute();

  return kills;
}

async function fetchDamages(checksum: string, steamId: string, type: WatchType): Promise<Action[]> {
  let damagesQuery = db
    .selectFrom('damages')
    .select([
      'tick',
      'round_number as roundNumber',
      'attacker_steam_id as playerSteamId',
      'victim_steam_id as opponentSteamId',
    ])
    .leftJoin('players as p1', function (qb) {
      return qb
        .onRef('p1.match_checksum', '=', 'damages.match_checksum')
        .onRef(
          'p1.steam_id',
          '=',
          type === WatchType.Highlights ? 'damages.attacker_steam_id' : 'damages.victim_steam_id',
        );
    })
    .select(['p1.index as playerSlot'])
    .leftJoin('players as p2', function (qb) {
      return qb
        .onRef('p2.match_checksum', '=', 'damages.match_checksum')
        .onRef(
          'p2.steam_id',
          '=',
          type === WatchType.Highlights ? 'damages.victim_steam_id' : 'damages.attacker_steam_id',
        );
    })
    .select(['p2.index as opponentSlot'])
    .where('damages.match_checksum', '=', checksum)
    .where('health_damage', '>=', 40)
    .where('victim_new_health', '>', 0) // Ignore damage resulting in a kill
    .orderBy('tick', 'asc');

  if (type === WatchType.Highlights) {
    damagesQuery = damagesQuery.where('attacker_steam_id', '=', steamId).where('victim_steam_id', '<>', steamId);
  } else {
    damagesQuery = damagesQuery.where('victim_steam_id', '=', steamId).where('attacker_steam_id', '<>', steamId);
  }
  const damages = await damagesQuery.execute();

  return damages;
}

type Options = {
  demoPath: string;
  steamId: string;
  type: WatchType;
  includeDamages: boolean;
};

export async function getPlaybackMatch({ demoPath, steamId, type, includeDamages }: Options) {
  const checksum = await getDemoChecksumFromDemoPath(demoPath);
  const match = await db
    .selectFrom('matches')
    .select(['checksum', 'tickrate', 'tick_count as tickCount'])
    .where('checksum', '=', checksum)
    .executeTakeFirst();

  if (!match) {
    return undefined;
  }

  let actions: Action[] = [];
  if (includeDamages) {
    const [kills, damages] = await Promise.all([
      fetchKills(checksum, steamId, type),
      fetchDamages(checksum, steamId, type),
    ]);
    actions = kills.concat(damages);
    actions.sort((actionA, actionB) => {
      return actionA.tick - actionB.tick;
    });
  } else {
    actions = await fetchKills(checksum, steamId, type);
  }

  const playbackMatch: PlaybackMatch = {
    checksum: match.checksum,
    tickrate: match.tickrate,
    tickCount: match.tickCount,
    demoPath,
    actions,
  };

  return playbackMatch;
}
