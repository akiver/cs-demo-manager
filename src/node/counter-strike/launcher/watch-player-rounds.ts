import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { deleteVdmFile } from './delete-vdm-file';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { db } from 'csdm/node/database/database';
import { fetchPlayersIndexes } from 'csdm/node/database/players/fetch-players-indexes';
import { generatePlayerRoundsVdmFile } from 'csdm/node/vdm/generate-player-rounds-vdm-file';
import { NoRoundsFound } from './errors/not-rounds-found';
import { generatePlayerRoundsJsonFile } from '../json-actions-file/generate-player-rounds-json-file';

export type Round = {
  number: number;
  tickEnd: number;
  freezeTimeEndTick: number;
};

async function fetchRounds(checksum: string) {
  const rows = await db
    .selectFrom('rounds')
    .select(['number', 'freeze_time_end_tick', 'end_tick'])
    .where('match_checksum', '=', checksum)
    .orderBy('freeze_time_end_tick', 'asc')
    .execute();

  const rounds: Round[] = rows.map((row) => {
    return {
      number: row.number,
      tickEnd: row.end_tick,
      freezeTimeEndTick: row.freeze_time_end_tick,
    };
  });

  return rounds;
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
  const rounds = await fetchRounds(checksum);
  if (rounds.length === 0) {
    throw new NoRoundsFound();
  }

  if (game !== Game.CSGO) {
    const playersIndexes = await fetchPlayersIndexes(checksum);
    let playerIndex = steamId;
    if (playersIndexes[steamId]) {
      playerIndex = String(playersIndexes[steamId]);
    }

    await generatePlayerRoundsJsonFile({
      demoPath,
      rounds,
      steamId: playerIndex,
    });
  } else {
    await generatePlayerRoundsVdmFile({
      demoPath,
      rounds,
      steamId,
    });
  }

  await startCounterStrike({
    demoPath,
    game,
    onGameStart,
  });
}
