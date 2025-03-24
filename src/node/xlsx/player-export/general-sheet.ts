import type { Column } from '../column';
import { Sheet } from '../sheet';
import type { PlayerProfile } from 'csdm/common/types/player-profile';
import type { Workbook } from '../workbook';
import { roundNumber } from 'csdm/common/math/round-number';

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
        name: 'steam_id',
        cellFormatter: (row) => row.steamId,
      },
      {
        name: 'name',
        cellFormatter: (row) => row.name,
      },
      {
        name: 'match_count',
        cellFormatter: (row) => row.matchCount,
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
      {
        name: 'kd',
        cellFormatter: (row) => roundNumber(row.killDeathRatio, 1),
      },
      {
        name: 'mvp',
        cellFormatter: (row) => row.mvpCount,
      },
      {
        name: 'headshot_count',
        cellFormatter: (row) => row.headshotCount,
      },
      {
        name: 'headshot_percentage',
        cellFormatter: (row) => roundNumber(row.headshotPercentage, 1),
      },
      {
        name: 'competitive_rank',
        cellFormatter: (row) => row.competitiveRank,
      },
      {
        name: 'premier_rank',
        cellFormatter: (row) => row.premierRank,
      },
      {
        name: 'HLTV',
        cellFormatter: (row) => roundNumber(row.hltvRating, 2),
      },
      {
        name: 'HLTV 2.0',
        cellFormatter: (row) => roundNumber(row.hltvRating2, 2),
      },
      {
        name: 'kast',
        cellFormatter: (row) => roundNumber(row.kast, 1),
      },
      {
        name: 'adr',
        cellFormatter: (row) => roundNumber(row.averageDamagePerRound, 1),
      },
      {
        name: 'utility_damage',
        cellFormatter: (row) => row.utilityDamage,
      },
      {
        name: 'udr',
        cellFormatter: (row) => roundNumber(row.averageUtilityDamagePerRound, 1),
      },
      {
        name: '3k',
        cellFormatter: (row) => row.threeKillCount,
      },
      {
        name: '4k',
        cellFormatter: (row) => row.fourKillCount,
      },
      {
        name: '5k',
        cellFormatter: (row) => row.fiveKillCount,
      },
      {
        name: 'game_ban_count',
        cellFormatter: (row) => row.gameBanCount,
      },
      {
        name: 'community_banned',
        cellFormatter: (row) => row.isCommunityBanned,
      },
      {
        name: 'vac_ban_count',
        cellFormatter: (row) => row.vacBanCount,
      },
    ];
  }

  public generate() {
    this.writeRow(this.player);
  }
}
