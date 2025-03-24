import type { Column } from '../column';
import { Sheet } from '../sheet';
import type { PlayerProfile } from 'csdm/common/types/player-profile';
import type { Workbook } from '../workbook';

export class GeneralSheet extends Sheet<PlayerProfile> {
  private readonly player: PlayerProfile;
  public constructor(workbook: Workbook, player: PlayerProfile) {
    super(workbook);
    this.player = player;
  }

  protected getName() {
    return 'General';
  }

  protected getColumns(): Column<PlayerProfile>[] {
    return [
      {
        name: 'steamid',
        cellFormatter: (row) => row.steamId,
      },
      {
        name: 'name',
        cellFormatter: (row) => row.name,
      },
      {
        name: 'kill_count',
        cellFormatter: (row) => row.killCount,
      },
      {
        name: 'assist_count',
        cellFormatter: (row) => row.assistCount,
      },
      {
        name: 'death_count',
        cellFormatter: (row) => row.deathCount,
      },
      {
        name: 'bomb_planted_count',
        cellFormatter: (row) => row.bombPlantedCount,
      },
      {
        name: 'bomb_defused_count',

        cellFormatter: (row) => row.bombDefusedCount,
      },
      {
        name: 'clutch_count',
        cellFormatter: (row) => row.clutches.length,
      },
    ];
  }

  public generate() {
    this.writeRow(this.player);
  }
}
