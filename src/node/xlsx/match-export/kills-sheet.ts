import type { Kill } from 'csdm/common/types/kill';
import type { Column } from '../column';
import { SingleMatchExportSheet } from './single-match-export-sheet';

export class KillsSheet extends SingleMatchExportSheet<Kill> {
  protected getName() {
    return 'Kills';
  }

  protected getColumns(): Column<Kill>[] {
    return [
      {
        name: 'round_number',
        cellFormatter: (row) => row.roundNumber,
      },
      {
        name: 'tick',
        cellFormatter: (row) => row.tick,
      },
      {
        name: 'frame',
        cellFormatter: (row) => row.frame,
      },
      {
        name: 'killer_steam_id',
        cellFormatter: (row) => row.killerSteamId,
      },
      {
        name: 'killer_name',
        cellFormatter: (row) => row.killerName,
      },
      {
        name: 'killer_side',
        cellFormatter: (row) => row.killerSide,
      },
      {
        name: 'victim_steam_id',
        cellFormatter: (row) => row.victimSteamId,
      },
      {
        name: 'victim_name',
        cellFormatter: (row) => row.victimName,
      },
      {
        name: 'victim_side',
        cellFormatter: (row) => row.victimSide,
      },
      {
        name: 'assister_steam_id',
        cellFormatter: (row) => row.assisterSteamId,
      },
      {
        name: 'assister_name',
        cellFormatter: (row) => row.assisterName,
      },
      {
        name: 'assister_side',
        cellFormatter: (row) => row.assisterSide,
      },
      {
        name: 'weapon_name',
        cellFormatter: (row) => row.weaponName,
      },
      {
        name: 'penetrated_objects',
        cellFormatter: (row) => row.penetratedObjects,
      },
      {
        name: 'distance',
        cellFormatter: (row) => row.distance,
      },
      {
        name: 'is_headshot',
        cellFormatter: (row) => row.isHeadshot,
      },
      {
        name: 'is_assisted_flash',
        cellFormatter: (row) => row.isAssistedFlash,
      },
      {
        name: 'is_trade_kill',
        cellFormatter: (row) => row.isTradeKill,
      },
      {
        name: 'is_trade_death',
        cellFormatter: (row) => row.isTradeDeath,
      },
      {
        name: 'is_no_scope',
        cellFormatter: (row) => row.isNoScope,
      },
      {
        name: 'is_through_smoke',
        cellFormatter: (row) => row.isThroughSmoke,
      },
      {
        name: 'is_killer_airbone',
        cellFormatter: (row) => row.isKillerAirborne,
      },
      {
        name: 'is_victim_airbone',
        cellFormatter: (row) => row.isVictimAirborne,
      },
      {
        name: 'is_killer_blinded',
        cellFormatter: (row) => row.isKillerBlinded,
      },
      {
        name: 'is_victim_blinded',
        cellFormatter: (row) => row.isVictimBlinded,
      },
      {
        name: 'is_killer_controlling_bot',
        cellFormatter: (row) => row.isKillerControllingBot,
      },
      {
        name: 'is_victim_controlling_bot',
        cellFormatter: (row) => row.isVictimControllingBot,
      },
      {
        name: 'is_assister_controlling_bot',
        cellFormatter: (row) => row.isAssisterControllingBot,
      },
      {
        name: 'killer_x',
        cellFormatter: (row) => row.killerX,
      },
      {
        name: 'killer_y',
        cellFormatter: (row) => row.killerY,
      },
      {
        name: 'killer_z',
        cellFormatter: (row) => row.killerZ,
      },
      {
        name: 'victim_x',
        cellFormatter: (row) => row.victimX,
      },
      {
        name: 'victim_y',
        cellFormatter: (row) => row.victimY,
      },
      {
        name: 'victim_z',
        cellFormatter: (row) => row.victimZ,
      },
      {
        name: 'assister_x',
        cellFormatter: (row) => row.assisterX,
      },
      {
        name: 'assister_y',
        cellFormatter: (row) => row.assisterY,
      },
      {
        name: 'assister_z',
        cellFormatter: (row) => row.assisterZ,
      },
    ];
  }

  public generate() {
    for (const kill of this.match.kills) {
      this.writeRow(kill);
    }
  }
}
