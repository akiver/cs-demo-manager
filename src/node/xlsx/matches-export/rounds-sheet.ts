import type { RoundRow } from 'csdm/node/database/xlsx/fetch-rounds-rows';
import { fetchRoundsRows } from 'csdm/node/database/xlsx/fetch-rounds-rows';
import type { Column } from '../column';
import { MultipleMatchExportSheet } from './multiple-match-export-sheet';

export class RoundsSheet extends MultipleMatchExportSheet<RoundRow> {
  protected getName() {
    return 'Rounds';
  }

  protected getColumns(): Column<RoundRow>[] {
    return [
      {
        name: 'match_checksum',
        cellFormatter: (row) => row.matchChecksum,
      },
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
        cellFormatter: (row) => row.freezeTimeEndTick,
      },
      {
        name: 'freeze_time_end_frame',
        cellFormatter: (row) => row.freezeTimeEndFrame,
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
        cellFormatter: (row) => row.scoreTeamA,
      },
      {
        name: 'score_team_b',
        cellFormatter: (row) => row.scoreTeamB,
      },
      {
        name: 'team_a_side',
        cellFormatter: (row) => row.sideTeamA,
      },
      {
        name: 'team_b_side',
        cellFormatter: (row) => row.sideTeamB,
      },
      {
        name: 'winner_side',
        cellFormatter: (row) => row.winnerSide,
      },
      {
        name: 'winner_name',
        cellFormatter: (row) => {
          return row.winnerName === null ? 'Unknown' : row.winnerName;
        },
      },
      {
        name: 'end_reason',
        cellFormatter: (row) => row.endReason,
      },
      {
        name: 'start_money_team_a',

        cellFormatter: (row) => row.startMoneyTeamA,
      },
      {
        name: 'start_money_team_b',
        cellFormatter: (row) => row.startMoneyTeamB,
      },
    ];
  }

  public async generate() {
    const rows = await fetchRoundsRows(this.checksums);
    for (const row of rows) {
      this.writeRow(row);
    }
  }
}
