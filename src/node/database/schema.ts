import type { PlayerBanPerMatchTable } from './bans/player-ban-per-match-table';
import type { BombDefuseStartTable } from './bomb-defuse-start/bomb-defuse-start-table';
import type { BombDefusedTable } from './bomb-defused/bomb-defused-table';
import type { BombExplodedTable } from './bomb-exploded/bomb-exploded-table';
import type { BombPlantStartTable } from './bomb-plant-start/bomb-plant-start-table';
import type { BombPlantedTable } from './bomb-planted/bomb-planted-table';
import type { ChatMessageTable } from './chat-messages/chat-message-table';
import type { ChickenDeathTable } from './chicken-death/chicken-death-table';
import type { ChickenPositionTable } from './chicken-position/chicken-position-table';
import type { ClutchTable } from './clutches/clutch-table';
import type { CommentTable } from './comments/comment-table';
import type { PlayerCommentTable } from './comments/player-comments-table';
import type { DamageTable } from './damages/damage-table';
import type { DecoyStartTable } from './decoy-started/decoy-start-table';
import type { DemoPathTable } from './demos/demo-path-table';
import type { DemoTable } from './demos/demo-table';
import type { DownloadHistoryTable } from './download-history/download-history-table';
import type { FaceitAccountTable } from './faceit-account/faceit-account-row';
import type { FaceitMatchPlayerTable } from './faceit-matches/faceit-match-player-table';
import type { FaceitMatchTable } from './faceit-matches/faceit-match-table';
import type { FaceitMatchTeamTable } from './faceit-matches/faceit-match-team-table';
import type { FiveEPlayAccountTable } from './5play-account/5eplay-account-row';
import type { FlashbangExplodeTable } from './flashbang-exploded/flashbang-explode-table';
import type { GrenadeBounceTable } from './grenade-bounce/grenade-bounce-table';
import type { GrenadePositionTable } from './grenade-position/grenade-position-table';
import type { GrenadeProjectileDestroyTable } from './grenade-projectile-destroy/grenade-projectile-destroy-table';
import type { HeGrenadeExplodeTable } from './he-grenade-exploded/he-grenade-explode-table';
import type { HostagePickUpStartTable } from './hostage-pick-up-start/hostage-pick-up-start-table';
import type { HostagePickedUpTable } from './hostage-picked-up/hostage-picked-up-table';
import type { HostagePositionTable } from './hostage-position/hostage-position-table';
import type { HostageRescuedTable } from './hostage-rescued/hostage-rescued-table';
import type { InfernoPositionTable } from './inferno-position/inferno-position-table';
import type { KillTable } from './kills/kill-table';
import type { MapTable } from './maps/map-table';
import type { MatchPlayerTable } from './match-players/match-player-table';
import type { MatchTable } from './matches/match-table';
import type { MigrationTable } from './migrations/migration-table';
import type { PlayerBlindTable } from './player-blinds/player-blind-table';
import type { PlayerBuyTable } from './player-buy/player-buy-table';
import type { PlayerEconomyTable } from './player-economies/player-economy-table';
import type { PlayerPositionTable } from './player-position/player-position-table';
import type { RoundTable } from './rounds/round-table';
import type { ShotTable } from './shots/shot-table';
import type { SmokeStartTable } from './smoke-started/smoke-start-table';
import type { IgnoredSteamAccountTable } from './steam-accounts/ignored-steam-account-table';
import type { SteamAccountOverridesTable } from './steam-accounts/steam-account-overrides-table';
import type { SteamAccountTable } from './steam-accounts/steam-account-table';
import type { ChecksumTagTable } from './tags/checksum-tag-table';
import type { RoundTagTable } from './tags/round-tag-table';
import type { SteamAccountTagTable } from './tags/steam-account-tag-table';
import type { TagTable } from './tags/tag-table';
import type { TeamTable } from './teams/team-table';
import type { TimestampTable } from './timestamps/timestamp-table';

export type Database = {
  bombs_defuse_start: BombDefuseStartTable;
  bombs_defused: BombDefusedTable;
  bombs_exploded: BombExplodedTable;
  bombs_plant_start: BombPlantStartTable;
  bombs_planted: BombPlantedTable;
  chicken_deaths: ChickenDeathTable;
  clutches: ClutchTable;
  chat_messages: ChatMessageTable;
  checksum_tags: ChecksumTagTable;
  chicken_positions: ChickenPositionTable;
  comments: CommentTable;
  damages: DamageTable;
  decoys_start: DecoyStartTable;
  demo_paths: DemoPathTable;
  demos: DemoTable;
  download_history: DownloadHistoryTable;
  faceit_accounts: FaceitAccountTable;
  faceit_match_players: FaceitMatchPlayerTable;
  faceit_match_teams: FaceitMatchTeamTable;
  faceit_matches: FaceitMatchTable;
  '5eplay_accounts': FiveEPlayAccountTable;
  flashbangs_explode: FlashbangExplodeTable;
  grenade_bounces: GrenadeBounceTable;
  grenade_positions: GrenadePositionTable;
  grenade_projectiles_destroy: GrenadeProjectileDestroyTable;
  he_grenades_explode: HeGrenadeExplodeTable;
  hostage_pick_up_start: HostagePickUpStartTable;
  hostage_picked_up: HostagePickedUpTable;
  hostage_positions: HostagePositionTable;
  hostage_rescued: HostageRescuedTable;
  ignored_steam_accounts: IgnoredSteamAccountTable;
  inferno_positions: InfernoPositionTable;
  kills: KillTable;
  migrations: MigrationTable;
  timestamps: TimestampTable;
  maps: MapTable;
  matches: MatchTable;
  player_ban_per_match: PlayerBanPerMatchTable;
  player_comments: PlayerCommentTable;
  player_blinds: PlayerBlindTable;
  player_buys: PlayerBuyTable;
  player_economies: PlayerEconomyTable;
  player_positions: PlayerPositionTable;
  players: MatchPlayerTable;
  round_tags: RoundTagTable;
  rounds: RoundTable;
  shots: ShotTable;
  smokes_start: SmokeStartTable;
  steam_accounts: SteamAccountTable;
  steam_account_overrides: SteamAccountOverridesTable;
  steam_account_tags: SteamAccountTagTable;
  tags: TagTable;
  teams: TeamTable;
};
