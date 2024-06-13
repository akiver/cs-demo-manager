import { WatchType } from 'csdm/common/types/watch-type';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { db } from '../database';

type Action = {
  tick: number;
  roundNumber: number;
  playerSteamId?: string; // optional because it may be the "world"
  opponentSteamId: string;
};

export type PlaybackMatch = {
  checksum: string;
  steamId: string;
  demoPath: string;
  tickCount: number;
  tickrate: number;
  actions: Action[];
};

async function fetchKills(checksum: string, steamId: string, type: WatchType) {
  let killsQuery = db
    .selectFrom('kills')
    .select([
      'tick',
      'round_number as roundNumber',
      'killer_steam_id as playerSteamId',
      'victim_steam_id as opponentSteamId',
    ])
    .where('match_checksum', '=', checksum)
    .orderBy('tick', 'asc');

  if (type === WatchType.Highlights) {
    killsQuery = killsQuery.where('killer_steam_id', '=', steamId).where('victim_steam_id', '<>', steamId);
  } else {
    killsQuery = killsQuery.where('victim_steam_id', '=', steamId).where('killer_steam_id', '<>', steamId);
  }
  const kills: Action[] = await killsQuery.execute();

  return kills;
}

async function fetchDamages(checksum: string, steamId: string, type: WatchType) {
  let damagesQuery = db
    .selectFrom('damages')
    .select([
      'tick',
      'round_number as roundNumber',
      'attacker_steam_id as playerSteamId',
      'victim_steam_id as opponentSteamId',
    ])
    .where('match_checksum', '=', checksum)
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
    steamId,
    checksum: match.checksum,
    tickrate: match.tickrate,
    tickCount: match.tickCount,
    demoPath,
    actions,
  };

  return playbackMatch;
}
