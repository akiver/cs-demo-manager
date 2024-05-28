import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { deleteVdmFile } from './delete-vdm-file';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { db } from 'csdm/node/database/database';
import { generatePlayerRoundsVdmFile } from 'csdm/node/vdm/generate-player-rounds-vdm-file';
import { NoRoundsFound } from './errors/not-rounds-found';
import { generatePlayerRoundsJsonFile } from '../json-actions-file/generate-player-rounds-json-file';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';

export type Round = {
  number: number;
  tickEnd: number;
  freezeTimeEndTick: number;
  deathTick: number | null;
};

async function fetchRounds(checksum: string, steamId: string) {
  const rows = await db
    .selectFrom('rounds')
    .select(['number', 'freeze_time_end_tick', 'end_tick'])
    .where('rounds.match_checksum', '=', checksum)
    .leftJoin('kills', function (qb) {
      return qb
        .onRef('kills.match_checksum', '=', 'rounds.match_checksum')
        .onRef('kills.round_number', '=', 'rounds.number')
        .on('kills.victim_steam_id', '=', steamId);
    })
    .select(['kills.tick as deathTick'])
    .orderBy('rounds.freeze_time_end_tick', 'asc')
    .execute();

  const rounds: Round[] = rows.map((row) => {
    return {
      number: row.number,
      tickEnd: row.end_tick,
      freezeTimeEndTick: row.freeze_time_end_tick,
      deathTick: row.deathTick,
    };
  });

  return rounds;
}

async function fetchMatchTickrate(checksum: string) {
  const row = await db
    .selectFrom('matches')
    .select(['tickrate'])
    .where('matches.checksum', '=', checksum)
    .executeTakeFirst();

  return row?.tickrate ?? 64;
}

type Options = {
  demoPath: string;
  steamId: string;
  onGameStart: () => void;
};

export async function watchPlayerRounds({ demoPath, steamId, onGameStart }: Options) {
  const game = await detectDemoGame(demoPath);
  if (game === Game.CSGO) {
    await deleteVdmFile(demoPath);
  } else {
    await deleteJsonActionsFile(demoPath);
  }

  const checksum = await getDemoChecksumFromDemoPath(demoPath);
  const rounds = await fetchRounds(checksum, steamId);
  if (rounds.length === 0) {
    throw new NoRoundsFound();
  }

  const settings = await getSettings();
  const { round, playerVoicesEnabled } = settings.playback;
  const { beforeRoundDelayInSeconds, afterRoundDelayInSeconds } = round;
  if (game !== Game.CSGO) {
    await generatePlayerRoundsJsonFile({
      demoPath,
      rounds,
      steamId,
      beforeDelaySeconds: beforeRoundDelayInSeconds,
      afterDelaySeconds: afterRoundDelayInSeconds,
      playerVoicesEnabled,
    });
  } else {
    const tickrate = await fetchMatchTickrate(checksum);
    await generatePlayerRoundsVdmFile({
      tickrate,
      demoPath,
      rounds,
      steamId,
      beforeDelaySeconds: beforeRoundDelayInSeconds,
      afterDelaySeconds: afterRoundDelayInSeconds,
    });
  }

  if (settings.playback.useHlae) {
    await watchDemoWithHlae({
      demoPath,
      game,
      onGameStart,
    });
  } else {
    await startCounterStrike({
      demoPath,
      game,
      onGameStart,
    });
  }
}
