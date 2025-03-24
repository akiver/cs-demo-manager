import type { Generated } from 'kysely';
import type { PlayerColor, Rank, RankType } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type MatchPlayerTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  steam_id: string;
  // This column is used only for CS2 demos to focus the camera on players.
  // It's necessary only for CS2 because the command spec_lock_to_accountid doesn't work when the current logged in
  // Steam account is the player that you would like to focus on AND if the demo comes from a non Valve server.
  // See https://github.com/akiver/cs-demo-manager/issues/775
  //
  // This column used to be the player's entity index before v3.3.0 and we were using it to send keyboard events to
  // the game to focus the camera on players.
  // Since v3.3.0, we used the recently added spec_lock_to_accountid command to focus the camera on players so this
  // column was not used anymore and filled with 0 values by the demo analyzer.
  // Since v3.6.0, the demo analyzer fills this column with players' "slot".
  // Since v3.7.0 this field is used to focus the camera on players using the spec_player command rather than the Steam ID.
  //
  // It means that demos analyzed with the app < v3.6.0 have incorrect values and re-analyzing them is mandatory.
  // This column could be renamed to "slot" but to avoid an "unnecessary" database migration this column will stick with
  // "index" as a name.
  index: number;
  name: string;
  kill_count: number;
  death_count: number;
  assist_count: number;
  kill_death_ratio: number;
  damage_health: number;
  damage_armor: number;
  average_damage_per_round: number;
  average_kill_per_round: number;
  average_death_per_round: number;
  utility_damage_per_round: number;
  headshot_count: number;
  headshot_percentage: number;
  first_kill_count: number;
  first_death_count: number;
  mvp_count: number;
  rank_type: RankType;
  rank: Rank;
  old_rank: Rank;
  wins_count: number;
  bomb_planted_count: number;
  bomb_defused_count: number;
  hostage_rescued_count: number;
  score: number;
  team_name: string;
  kast: number;
  utility_damage: number;
  trade_kill_count: number;
  trade_death_count: number;
  first_trade_kill_count: number;
  first_trade_death_count: number;
  one_kill_count: number;
  two_kill_count: number;
  three_kill_count: number;
  four_kill_count: number;
  five_kill_count: number;
  hltv_rating: number;
  hltv_rating_2: number;
  crosshair_share_code: string;
  color: PlayerColor;
  inspect_weapon_count: number;
};
