/**
 * * Lookup for protobuf messages definition quoted below here: https://github.com/SteamDatabase/Protobufs/blob/master/csgo/cstrike15_gcmessages.proto
 *
 * Returns the map name based on the "game_type" field coming from a CMsgGCCStrike15_v2_MatchmakingGC2ServerReserve message.
 * The CMsgGCCStrike15_v2_MatchmakingGC2ServerReserve message should comes from the last
 * CMsgGCCStrike15_v2_MatchmakingServerRoundStats entry of the field "roundstatsall" of a CDataGCCStrike15_v2_MatchInfo message.
 *
 * The bottom byte (gameType & 0xff) is the game mode, usually 8 for official competitive matches, the remaining
 * 24-bits indicate the map (up to 1 << 23).
 * Maps values are hard coded in CSGO and may change between CSGO operations.
 * The only way to have accurate maps name is to update this file and publish a new CS:DM version when necessary.
 */
export function getMapName(gameType: number) {
  const DE_THERA = 1 << 0;
  const DE_DUST2 = 1 << 1;
  const DE_TRAIN = 1 << 2;
  const DE_ANCIENT = 1 << 3;
  const DE_INFERNO = 1 << 4;
  const DE_NUKE = 1 << 5;
  const DE_VERTIGO = 1 << 6;
  const DE_MIRAGE = 1 << 7;
  const DE_ASSEMBLY = 1 << 8;
  const DE_MEMENTO = 1 << 9;
  const CS_ASSAULT = 1 << 10;
  const CS_MILITIA = 1 << 11;
  const DE_CACHE = 1 << 12;
  const DE_MILLS = 1 << 13;
  const DE_BREACH = 1 << 14;
  const DE_ANUBIS = 1 << 15;
  const DE_TUSCAN = 1 << 16;
  const DE_BASALT = 1 << 18;
  const DE_OVERPASS = 1 << 20;
  const DE_COBBLESTONE = 1 << 21;
  const DE_CANALS = 1 << 22;

  const value = (gameType >> 8) & 0xffffff;
  switch (value) {
    case CS_ASSAULT:
      return 'cs_assault';
    case CS_MILITIA:
      return 'cs_militia';
    case DE_ANUBIS:
      return 'de_anubis';
    case DE_ANCIENT:
      return 'de_ancient';
    case DE_ASSEMBLY:
      return 'de_assembly';
    case DE_BASALT:
      return 'de_basalt';
    case DE_BREACH:
      return 'de_breach';
    case DE_CACHE:
      return 'de_cache';
    case DE_COBBLESTONE:
      return 'de_cobblestone';
    case DE_CANALS:
      return 'de_canals';
    case DE_DUST2:
      return 'de_dust2';
    case DE_INFERNO:
      return 'de_inferno';
    case DE_MEMENTO:
      return 'de_memento';
    case DE_MILLS:
      return 'de_mills';
    case DE_MIRAGE:
      return 'de_mirage';
    case DE_NUKE:
      return 'de_nuke';
    case DE_OVERPASS:
      return 'de_overpass';
    case DE_THERA:
      return 'de_thera';
    case DE_TRAIN:
      return 'de_train';
    case DE_TUSCAN:
      return 'de_tuscan';
    case DE_VERTIGO:
      return 'de_vertigo';
    default:
      return 'Unknown';
  }
}
