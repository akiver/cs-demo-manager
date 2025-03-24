import type { PlayerMapsStats } from 'csdm/common/types/map-stats';
import type { Column } from '../column';
import { MultiplePlayerExportSheet } from './multiple-player-export-sheet';
import { roundNumber } from 'csdm/common/math/round-number';
import { fetchPlayersMapsStats } from 'csdm/node/database/players/fetch-players-maps-stats';

export class MapsSheet extends MultiplePlayerExportSheet<PlayerMapsStats> {
  protected getName() {
    return 'Maps';
  }

  protected getColumns(): Column<PlayerMapsStats>[] {
    return [
      {
        name: 'steam_id',
        cellFormatter: (row) => row.steamId,
      },
      {
        name: 'map',
        cellFormatter: (row) => row.mapName,
      },
      {
        name: 'match_count',
        cellFormatter: (row) => row.matchCount,
      },
      {
        name: 'win_count',
        cellFormatter: (row) => row.winCount,
      },
      {
        name: 'lost_count',
        cellFormatter: (row) => row.lostCount,
      },
      {
        name: 'tied_count',
        cellFormatter: (row) => row.tiedCount,
      },
      {
        name: 'round_count',
        cellFormatter: (row) => row.roundCount,
      },
      {
        name: 'round_count_as_ct',
        cellFormatter: (row) => row.roundCountAsCt,
      },
      {
        name: 'round_count_as_t',
        cellFormatter: (row) => row.roundCountAsT,
      },
      {
        name: 'round_win_count',
        cellFormatter: (row) => row.roundWinCount,
      },
      {
        name: 'round_lost_count',
        cellFormatter: (row) => row.roundLostCount,
      },
      {
        name: 'round_win_count_as_ct',
        cellFormatter: (row) => row.roundWinCountAsCt,
      },
      {
        name: 'round_win_count_as_t',
        cellFormatter: (row) => row.roundWinCountAsT,
      },
      {
        name: 'kd',
        cellFormatter: (row) => roundNumber(row.killDeathRatio, 1),
      },
      {
        name: 'hs_percentage',
        cellFormatter: (row) => roundNumber(row.headshotPercentage, 1),
      },
      {
        name: 'kast',
        cellFormatter: (row) => roundNumber(row.kast, 1),
      },
      {
        name: 'avg_damages_per_round',
        cellFormatter: (row) => roundNumber(row.averageDamagesPerRound),
      },
    ];
  }

  public async generate() {
    const stats = await fetchPlayersMapsStats(this.steamIds);
    for (const row of stats) {
      this.writeRow(row);
    }
  }
}
