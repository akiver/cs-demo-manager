import { db } from 'csdm/node/database/database';
import type { PlayerPositionSampleTable } from './player-position-sample-table';
import { samplePlayerPositions } from './sample-player-positions';

// Number of rows per INSERT statement, rows hold a few KB of binary data.
const batchSize = 200;

// Builds the player_position_samples rows of a match from its player_positions rows.
// The match positions must already be in the database, existing samples of the match are replaced.
export async function insertPlayerPositionSamples(checksum: string) {
  const demo = await db.selectFrom('demos').select('tickrate').where('checksum', '=', checksum).executeTakeFirst();
  if (demo === undefined) {
    return;
  }

  await db.deleteFrom('player_position_samples').where('match_checksum', '=', checksum).execute();

  // Positions during the freeze time are not relevant, players are standing still at their spawn.
  const rounds = await db
    .selectFrom('rounds')
    .select(['number', 'freeze_time_end_tick'])
    .where('match_checksum', '=', checksum)
    .execute();
  const freezeTimeEndTickPerRound = new Map(rounds.map((round) => [round.number, round.freeze_time_end_tick]));

  // One position per second is enough for a heatmap.
  const sampleInterval = Math.max(1, Math.round(demo.tickrate));
  const rows = await db
    .selectFrom('player_positions')
    .select(['round_number', 'player_steam_id', 'ticks', 'x', 'y', 'z', 'state_ticks', 'is_alive', 'side'])
    .where('match_checksum', '=', checksum)
    .execute();

  const samples: PlayerPositionSampleTable[] = [];
  for (const row of rows) {
    const playerSamples = samplePlayerPositions(row, {
      sampleInterval,
      startTick: freezeTimeEndTickPerRound.get(row.round_number) ?? 0,
    });
    if (playerSamples === null) {
      continue;
    }
    samples.push({
      match_checksum: checksum,
      round_number: row.round_number,
      player_steam_id: row.player_steam_id,
      ...playerSamples,
    });
  }

  for (let index = 0; index < samples.length; index += batchSize) {
    await db
      .insertInto('player_position_samples')
      .values(samples.slice(index, index + batchSize))
      .execute();
  }
}
