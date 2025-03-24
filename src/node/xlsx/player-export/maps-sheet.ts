import { roundNumber } from 'csdm/common/math/round-number';
import type { Column } from '../column';
import type { MapStats } from 'csdm/common/types/map-stats';
import { fetchPlayerMapsStats } from 'csdm/node/database/player/fetch-player-maps-stats';
import { SinglePlayerExportSheet } from './single-player-export-sheet';

export class MapsSheet extends SinglePlayerExportSheet<MapStats> {
  protected getName() {
    return 'Maps';
  }

  protected getColumns(): Column<MapStats>[] {
    return [
      {
        name: 'name',
        cellFormatter: (row) => row.mapName,
      },
      {
        name: 'match_count',
        cellFormatter: (row) => row.matchCount,
      },
      {
        name: 'match_win_count',
        cellFormatter: (row) => row.winCount,
      },
      {
        name: 'match_loss_count',
        cellFormatter: (row) => row.lostCount,
      },
      {
        name: 'match_tie_count',
        cellFormatter: (row) => row.tiedCount,
      },
      {
        name: 'round_count',
        cellFormatter: (row) => row.roundCount,
      },
      {
        name: 'round_win_count',
        cellFormatter: (row) => row.roundWinCount,
      },
      {
        name: 'round_loss_count',
        cellFormatter: (row) => row.roundLostCount,
      },
      {
        name: 'round_count_as_ct',
        cellFormatter: (row) => row.roundCountAsCt,
      },
      {
        name: 'round_win_count_as_ct',
        cellFormatter: (row) => row.roundWinCountAsCt,
      },
      {
        name: 'round_count_as_t',
        cellFormatter: (row) => row.roundCountAsT,
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
        name: 'adr',
        cellFormatter: (row) => roundNumber(row.averageDamagesPerRound, 1),
      },
      {
        name: 'headshot_percentage',
        cellFormatter: (row) => roundNumber(row.headshotPercentage, 1),
      },
      {
        name: 'kast',
        cellFormatter: (row) => roundNumber(row.kast, 1),
      },
    ];
  }

  public async generate() {
    const maps = await fetchPlayerMapsStats(this.steamId, this.filters);
    for (const map of maps) {
      this.writeRow(map);
    }
  }
}
