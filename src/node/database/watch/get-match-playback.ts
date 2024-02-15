import { WatchType } from 'csdm/common/types/watch-type';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { db } from '../database';

type PlaybackKill = {
  tick: number;
  roundNumber: number;
  killerSteamId?: string; // optional because it may be a kill by the "world"
  victimSteamId: string;
};

export type PlaybackMatch = {
  checksum: string;
  steamId: string;
  demoPath: string;
  tickCount: number;
  tickrate: number;
  kills: PlaybackKill[];
};

type Options = {
  demoPath: string;
  steamId: string;
  type: WatchType;
};

export async function getPlaybackMatch({ demoPath, steamId, type }: Options) {
  const checksum = await getDemoChecksumFromDemoPath(demoPath);
  const match = await db
    .selectFrom('matches')
    .select(['checksum', 'tickrate', 'tick_count as tickCount'])
    .where('checksum', '=', checksum)
    .executeTakeFirst();

  if (match === undefined) {
    return undefined;
  }

  let killsQuery = db
    .selectFrom('kills')
    .select([
      'tick',
      'round_number as roundNumber',
      'killer_steam_id as killerSteamId',
      'victim_steam_id as victimSteamId',
    ])
    .where('match_checksum', '=', checksum)
    .orderBy('tick', 'asc');

  if (type === WatchType.Highlights) {
    killsQuery = killsQuery.where('killer_steam_id', '=', steamId).where('victim_steam_id', '<>', steamId);
  } else {
    killsQuery = killsQuery.where('victim_steam_id', '=', steamId).where('killer_steam_id', '<>', steamId);
  }

  const kills: PlaybackKill[] = await killsQuery.execute();

  const playbackMatch: PlaybackMatch = {
    steamId,
    checksum: match.checksum,
    tickrate: match.tickrate,
    tickCount: match.tickCount,
    demoPath,
    kills,
  };

  return playbackMatch;
}
