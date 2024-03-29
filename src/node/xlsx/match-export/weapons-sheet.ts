import type { Column } from '../column';
import { SingleMatchExportSheet } from './single-match-export-sheet';
import { fetchWeaponsRows, type WeaponRow } from 'csdm/node/database/xlsx/fetch-weapons-rows';

export class WeaponsSheet extends SingleMatchExportSheet<WeaponRow> {
  protected getName() {
    return 'Weapons';
  }

  protected getColumns(): Column<WeaponRow>[] {
    return [
      {
        name: 'weapon_name',
        cellFormatter: (row) => row.weaponName,
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
    const rows = await fetchWeaponsRows([this.match.checksum]);
    for (const row of rows) {
      this.writeRow(row);
    }
  }
}
