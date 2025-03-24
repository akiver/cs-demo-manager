import type { Column } from '../column';
import { MultiplePlayerExportSheet } from './multiple-player-export-sheet';
import { fetchPlayersClutchStats, type PlayerClutchStats } from 'csdm/node/database/players/fetch-players-clutch-stats';

export class ClutchSheet extends MultiplePlayerExportSheet<PlayerClutchStats> {
  protected getName() {
    return 'Clutch';
  }
  protected getColumns(): Column<PlayerClutchStats>[] {
    return [
      {
        name: 'steam_id',
        cellFormatter: (row) => row.clutcherSteamId,
      },
      {
        name: 'clutch_count',
        cellFormatter: (row) => row.totalCount,
      },
      {
        name: '1v5_count',
        cellFormatter: (row) => row.vsFiveCount,
      },
      {
        name: '1v5_won_count',
        cellFormatter: (row) => row.vsFiveWonCount,
      },
      {
        name: '1v5_lost_count',
        cellFormatter: (row) => row.vsFiveLostCount,
      },
      {
        name: '1v4_count',
        cellFormatter: (row) => row.vsFourCount,
      },
      {
        name: '1v4_won_count',
        cellFormatter: (row) => row.vsFourWonCount,
      },
      {
        name: '1v4_lost_count',
        cellFormatter: (row) => row.vsFourLostCount,
      },
      {
        name: '1v3_count',
        cellFormatter: (row) => row.vsThreeCount,
      },
      {
        name: '1v3_won_count',
        cellFormatter: (row) => row.vsThreeWonCount,
      },
      {
        name: '1v3_lost_count',
        cellFormatter: (row) => row.vsThreeLostCount,
      },
      {
        name: '1v2_count',
        cellFormatter: (row) => row.vsTwoCount,
      },
      {
        name: '1v2_won_count',
        cellFormatter: (row) => row.vsTwoWonCount,
      },
      {
        name: '1v2_lost_count',
        cellFormatter: (row) => row.vsTwoLostCount,
      },
      {
        name: '1v1_count',
        cellFormatter: (row) => row.vsOneCount,
      },
      {
        name: '1v1_won_count',
        cellFormatter: (row) => row.vsOneWonCount,
      },
      {
        name: '1v1_lost_count',
        cellFormatter: (row) => row.vsOneLostCount,
      },
    ];
  }

  public async generate() {
    const rows = await fetchPlayersClutchStats([], this.steamIds);
    for (const row of rows) {
      this.writeRow(row);
    }
  }
}
