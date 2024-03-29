import type { Column } from '../column';
import { MultipleMatchExportSheet } from './multiple-match-export-sheet';
import { fetchWeaponsRows, type WeaponRow } from 'csdm/node/database/xlsx/fetch-weapons-rows';

export class WeaponsSheet extends MultipleMatchExportSheet<WeaponRow> {
  protected getName() {
    return 'Weapons';
  }

  protected getColumns(): Column<WeaponRow>[] {
    return [
      {
        name: 'name',
        cellFormatter: (kill) => kill.weaponName,
      },
      {
        name: 'kill_count',
        cellFormatter: (row) => row.killCount,
      },
      {
        name: 'shot_count',
        cellFormatter: (row) => row.shotCount,
      },
      {
        name: 'hit_count',
        cellFormatter: (row) => row.hitCount,
      },
      {
        name: 'health_damage',
        cellFormatter: (row) => row.healthDamage,
      },
      {
        name: 'armor_damage',
        cellFormatter: (row) => row.armorDamage,
      },
    ];
  }

  public async generate() {
    const rows = await fetchWeaponsRows(this.checksums);
    for (const row of rows) {
      this.writeRow(row);
    }
  }
}
