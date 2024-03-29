import type { Column } from '../column';
import { SingleMatchExportSheet } from './single-match-export-sheet';
import type { Clutch } from 'csdm/common/types/clutch';

export class CLutchesSheet extends SingleMatchExportSheet<Clutch> {
  protected getName() {
    return 'Clutches';
  }

  protected getColumns(): Column<Clutch>[] {
    return [
      {
        name: 'round_number',
        cellFormatter: (row) => row.roundNumber,
      },
      {
        name: 'steam_id',
        cellFormatter: (row) => row.clutcherSteamId,
      },
      {
        name: 'name',
        cellFormatter: (row) => row.clutcherName,
      },
      {
        name: 'side',
        cellFormatter: (row) => row.side,
      },
      {
        name: 'has_won',
        cellFormatter: (row) => row.won,
      },
      {
        name: 'opponent_count',
        cellFormatter: (row) => row.opponentCount,
      },
      {
        name: 'kill_count',
        cellFormatter: (row) => row.clutcherKillCount,
      },
    ];
  }

  public generate() {
    for (const row of this.match.clutches) {
      this.writeRow(row);
    }
  }
}
