import { roundNumber } from 'csdm/common/math/round-number';
import type { MatchRow } from 'csdm/node/database/xlsx/fetch-matches-rows';
import { fetchMatchesRows } from 'csdm/node/database/xlsx/fetch-matches-rows';
import type { Column } from '../column';
import { MultipleMatchExportSheet } from './multiple-match-export-sheet';

export class MatchesSheet extends MultipleMatchExportSheet<MatchRow> {
  protected getName() {
    return 'Matches';
  }

  protected getColumns(): Column<MatchRow>[] {
    return [
      {
        name: 'checksum',
        cellFormatter: (row) => row.checksum,
      },
      {
        name: 'name',
        cellFormatter: (row) => row.name,
      },
      {
        name: 'demo_path',
        cellFormatter: (row) => row.demoPath,
      },
      {
        name: 'date',
        cellFormatter: (row) => row.date,
      },
      {
        name: 'source',
        cellFormatter: (row) => row.source,
      },
      {
        name: 'map',
        cellFormatter: (row) => row.mapName,
      },
      {
        name: 'server_name',
        cellFormatter: (row) => row.serverName,
      },
      {
        name: 'clientname',
        cellFormatter: (row) => row.clientName,
      },
      {
        name: 'duration',
        cellFormatter: (row) => row.duration,
      },
      {
        name: 'tickrate',
        cellFormatter: (row) => roundNumber(row.tickrate),
      },
      {
        name: 'tick_count',
        cellFormatter: (row) => row.tickCount,
      },
      {
        name: 'frame_rate',
        cellFormatter: (row) => roundNumber(row.frameRate),
      },
      {
        name: 'name_team_a',
        cellFormatter: (row) => row.nameTeamA,
      },
      {
        name: 'name_team_b',
        cellFormatter: (row) => row.nameTeamB,
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
        cellFormatter: (row) => row.clutchCount,
      },
    ];
  }

  public async generate() {
    const rows = await fetchMatchesRows(this.checksums);
    for (const row of rows) {
      this.writeRow(row);
    }
  }
}
