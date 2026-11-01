import { db } from 'csdm/node/database/database';
import type { WatchType } from 'csdm/common/types/watch-type';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { fetchPlaybackActions, maxSecondsBetweenPlaybackActions } from 'csdm/node/database/watch/get-match-playback';

export type MatchHighlight = {
  steamId: string;
  playerName: string;
  // The player's side at the first action of the sequence.
  side: TeamNumber;
  startTick: number;
  endTick: number;
  // Kills, or deaths for a lowlight, plus the heavy damages when they are included.
  eventCount: number;
};

type Options = {
  checksum: string;
  type: WatchType;
  includeDamages: boolean;
  beforeDelaySeconds: number;
  afterDelaySeconds: number;
};

// The sequences the highlights (or lowlights) playback would play, for every player of the match: the same actions it
// is built from, grouped as it groups them, with the delays before the first one and after the last one.
export async function fetchMatchHighlights({
  checksum,
  type,
  includeDamages,
  beforeDelaySeconds,
  afterDelaySeconds,
}: Options): Promise<MatchHighlight[]> {
  const demo = await db
    .selectFrom('demos')
    .select(['tickrate', 'tick_count'])
    .where('checksum', '=', checksum)
    .executeTakeFirst();
  if (demo === undefined) {
    return [];
  }

  const [actions, playerRows] = await Promise.all([
    fetchPlaybackActions({ checksum, type, includeDamages }),
    db.selectFrom('players').select(['steam_id', 'name']).where('match_checksum', '=', checksum).execute(),
  ]);

  const playerNames = new Map(playerRows.map((row) => [row.steam_id, row.name]));
  const ticksBeforeFirstAction = Math.round(demo.tickrate * beforeDelaySeconds);
  const ticksAfterLastAction = Math.round(demo.tickrate * afterDelaySeconds);
  const maxTicksBetweenActions = Math.max(
    Math.round(demo.tickrate * maxSecondsBetweenPlaybackActions),
    ticksAfterLastAction,
  );
  const highlights: MatchHighlight[] = [];
  const lastHighlightPerPlayer = new Map<string, MatchHighlight>();
  const lastActionTickPerPlayer = new Map<string, number>();
  for (const action of actions) {
    const steamId = action.playerSteamId;
    if (steamId === null) {
      continue;
    }

    const endTick = Math.min(demo.tick_count, action.tick + ticksAfterLastAction);
    const lastHighlight = lastHighlightPerPlayer.get(steamId);
    const lastActionTick = lastActionTickPerPlayer.get(steamId);
    if (
      lastHighlight !== undefined &&
      lastActionTick !== undefined &&
      action.tick - lastActionTick <= maxTicksBetweenActions
    ) {
      lastHighlight.endTick = endTick;
      lastHighlight.eventCount += 1;
    } else {
      const highlight: MatchHighlight = {
        steamId,
        playerName: playerNames.get(steamId) ?? '',
        side: action.playerSide,
        startTick: Math.max(0, action.tick - ticksBeforeFirstAction),
        endTick,
        eventCount: 1,
      };
      highlights.push(highlight);
      lastHighlightPerPlayer.set(steamId, highlight);
    }
    lastActionTickPerPlayer.set(steamId, action.tick);
  }

  return highlights.sort((a, b) => a.startTick - b.startTick);
}
