import type { Column } from '../column';
import { Sheet } from '../sheet';
import type { PlayerProfile } from 'csdm/common/types/player-profile';
import type { Workbook } from '../workbook';

type MapStats = PlayerProfile['mapsStats'][number];

export class MapsSheet extends Sheet<MapStats> {
  private readonly maps: MapStats[];
  public constructor(workbook: Workbook, maps: MapStats[]) {
    super(workbook);
    this.maps = maps;
  }

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
        name: 'kill_death_ratio',
        cellFormatter: (row) => row.killDeathRatio,
      },
    ];
  }

  public generate() {
    for (const map of this.maps) {
      this.writeRow(map);
    }
  }
}
