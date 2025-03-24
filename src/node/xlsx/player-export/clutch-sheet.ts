import type { Column } from '../column';
import { roundNumber } from 'csdm/common/math/round-number';
import { fetchPlayerClutches } from 'csdm/node/database/player/fetch-player-clutches';
import { SinglePlayerExportSheet } from './single-player-export-sheet';

type ClutchRow = {
  opponentCount: number;
  totalCount: number;
  wonCount: number;
  lostCount: number;
  averageKill: number;
  winRate: number;
  saveRate: number;
};

export class ClutchSheet extends SinglePlayerExportSheet<ClutchRow> {
  protected getName() {
    return 'Clutch';
  }

  protected getColumns(): Column<ClutchRow>[] {
    return [
      {
        name: 'type',
        cellFormatter: (row) => {
          if (row.opponentCount === 0) {
            return 'overall';
          }
          return `1v${row.opponentCount}`;
        },
      },
      {
        name: 'total_count',
        cellFormatter: (row) => row.totalCount,
      },
      {
        name: 'won_count',
        cellFormatter: (row) => row.wonCount,
      },
      {
        name: 'lost_count',
        cellFormatter: (row) => row.lostCount,
      },
      {
        name: 'avg_kill_count',
        cellFormatter: (row) => row.averageKill,
      },
      {
        name: 'win_rate (%)',
        cellFormatter: (row) => row.winRate,
      },
      {
        name: 'save_rate (%)',
        cellFormatter: (row) => row.saveRate,
      },
    ];
  }

  public async generate() {
    const allClutches = await fetchPlayerClutches(this.steamId, this.filters);
    for (let opponentCount = 0; opponentCount <= 5; opponentCount++) {
      const clutches =
        opponentCount > 0 ? allClutches.filter((clutch) => clutch.opponentCount === opponentCount) : allClutches;
      const wonCount = clutches.filter((clutch) => clutch.won).length;
      const lostClutches = clutches.filter((clutch) => !clutch.won);
      const lostCount = lostClutches.length;
      const winRate = roundNumber((wonCount / clutches.length) * 100, 1);
      const saveClutchCount = lostClutches.filter((clutch) => clutch.hasClutcherSurvived).length;
      const saveRate = roundNumber((saveClutchCount / lostCount) * 100, 1);
      const killCount = clutches.reduce((previousClutch, clutch) => previousClutch + clutch.clutcherKillCount, 0);
      const averageKill = roundNumber(killCount / clutches.length, 1);
      this.writeRow({
        opponentCount,
        totalCount: clutches.length,
        wonCount,
        lostCount,
        averageKill,
        winRate,
        saveRate,
      });
    }
  }
}
