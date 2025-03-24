import type { Clutch } from 'csdm/common/types/clutch';
import type { Column } from '../column';
import { Sheet } from '../sheet';
import type { Workbook } from '../workbook';
import { roundNumber } from 'csdm/common/math/round-number';

type ClutchRow = {
  opponentCount: number;
  totalCount: number;
  wonCount: number;
  lostCount: number;
  averageKill: number;
  winRate: number;
  saveRate: number;
};

export class ClutchSheet extends Sheet<ClutchRow> {
  private readonly clutches: Clutch[];
  public constructor(workbook: Workbook, clutches: Clutch[]) {
    super(workbook);
    this.clutches = clutches;
  }

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

  public generate() {
    for (let opponentCount = 0; opponentCount <= 5; opponentCount++) {
      const clutches =
        opponentCount > 0 ? this.clutches.filter((clutch) => clutch.opponentCount === opponentCount) : this.clutches;
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
