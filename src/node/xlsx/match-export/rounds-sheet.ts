import type { Round } from 'csdm/common/types/round';
import type { Column } from '../column';
import { SingleMatchExportSheet } from './single-match-export-sheet';

export class RoundsSheet extends SingleMatchExportSheet<Round> {
  protected getName() {
    return 'Rounds';
  }

  protected getColumns(): Column<Round>[] {
    return [
      {
        name: 'number',
        cellFormatter: (row) => row.number,
      },
      {
        name: 'start_tick',
        cellFormatter: (row) => row.startTick,
      },
      {
        name: 'start_frame',
        cellFormatter: (row) => row.startFrame,
      },
      {
        name: 'freeze_time_end_tick',
        cellFormatter: (row) => row.freezetimeEndTick,
      },
      {
        name: 'freeze_time_end_frame',
        cellFormatter: (row) => row.freezetimeEndFrame,
      },
      {
        name: 'end_tick',
        cellFormatter: (row) => row.endTick,
      },
      {
        name: 'end_frame',
        cellFormatter: (row) => row.endFrame,
      },
      {
        name: 'duration',
        cellFormatter: (row) => row.duration,
      },
      {
        name: 'score_team_a',
        cellFormatter: (row) => row.teamAScore,
      },
      {
        name: 'score_team_b',
        cellFormatter: (row) => row.teamBScore,
      },
      {
        name: 'team_a_side',
        cellFormatter: (row) => row.teamASide,
      },
      {
        name: 'team_b_side',
        cellFormatter: (row) => row.teamBSide,
      },
      {
        name: 'winner_side',
        cellFormatter: (row) => row.winnerSide,
      },
      {
        name: 'winner_name',
        cellFormatter: (row) => {
          return row.winnerTeamName === null ? 'Unknown' : row.winnerTeamName;
        },
      },
      {
        name: 'end_reason',
        cellFormatter: (row) => row.endReason,
      },
      {
        name: 'start_money_team_a',
        cellFormatter: (row) => row.teamAStartMoney,
      },
      {
        name: 'start_money_team_b',
        cellFormatter: (row) => row.teamBStartMoney,
      },
      {
        name: 'team_a_equipment_value',
        cellFormatter: (row) => row.teamAEquipmentValue,
      },
      {
        name: 'team_b_equipment_value',
        cellFormatter: (row) => row.teamBEquipmentValue,
      },
    ];
  }

  public generate() {
    for (const round of this.match.rounds) {
      this.writeRow(round);
    }
  }
}
