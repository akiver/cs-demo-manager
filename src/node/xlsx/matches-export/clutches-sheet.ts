import type { Column } from '../column';
import { MultipleMatchExportSheet } from './multiple-match-export-sheet';
import { fetchClutchesRows, type ClutchRow } from 'csdm/node/database/xlsx/fetch-clutches-rows';

export class ClutchesSheet extends MultipleMatchExportSheet<ClutchRow> {
  protected getName() {
    return 'Clutches';
  }

  protected getColumns(): Column<ClutchRow>[] {
    return [
      {
        name: 'match_checksum',
        cellFormatter: (kill) => kill.matchChecksum,
      },
      {
        name: 'round_number',
        cellFormatter: (row) => row.roundNumber,
      },
      {
        name: 'tick',
        cellFormatter: (row) => row.tick,
      },
      {
        name: 'clutcher_steam_id',
        cellFormatter: (row) => row.playerSteamId,
      },
      {
        name: 'clutcher_name',
        cellFormatter: (row) => row.playerName,
      },
      {
        name: 'clutcher_side',
        cellFormatter: (row) => row.playerSide,
      },
      {
        name: 'opponent_count',
        cellFormatter: (row) => row.opponentCount,
      },
      {
        name: 'kill_count',
        cellFormatter: (row) => row.killCount,
      },
      {
        name: 'has_won',
        cellFormatter: (row) => row.hasWon,
      },
    ];
  }

  public async generate() {
    const rows = await fetchClutchesRows(this.checksums);
    for (const row of rows) {
      this.writeRow(row);
    }
  }
}
