import type { Match } from 'csdm/common/types/match';
import type { Column } from '../column';
import { SingleMatchExportSheet } from './single-match-export-sheet';

export class GeneralSheet extends SingleMatchExportSheet<Match> {
  protected getName() {
    return 'General';
  }

  protected getColumns(): Column<Match>[] {
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
        cellFormatter: (row) => row.demoFilePath,
      },
      {
        name: 'date',
        cellFormatter: (row) => new Date(row.date),
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
        cellFormatter: (row) => row.tickrate,
      },
      {
        name: 'tick_count',
        cellFormatter: (row) => row.tickCount,
      },
      {
        name: 'frame_rate',
        cellFormatter: (row) => row.frameRate,
      },
      {
        name: 'name_team_a',
        cellFormatter: (row) => row.teamA.name,
      },
      {
        name: 'name_team_b',
        cellFormatter: (row) => row.teamB.name,
      },
      {
        name: 'score_team_a',
        cellFormatter: (row) => row.teamA.score,
      },
      {
        name: 'score_team_b',
        cellFormatter: (row) => row.teamB.score,
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

        cellFormatter: (row) => row.bombsPlanted.length,
      },
      {
        name: 'bomb_defused_count',

        cellFormatter: (row) => row.bombsDefused.length,
      },
      {
        name: 'clutch_count',
        cellFormatter: (row) => row.clutches.length,
      },
    ];
  }

  public generate() {
    this.writeRow(this.match);
  }
}
