type GameMode = 8 | 10;

/**
 * * Lookup for protobuf messages definition quoted below here: https://github.com/SteamDatabase/Protobufs/blob/master/csgo/cstrike15_gcmessages.proto
 *
 * Returns the map name based on the "game_type" field coming from a CMsgGCCStrike15_v2_MatchmakingGC2ServerReserve message.
 * The CMsgGCCStrike15_v2_MatchmakingGC2ServerReserve message should comes from the last
 * CMsgGCCStrike15_v2_MatchmakingServerRoundStats entry of the field "roundstatsall" of a CDataGCCStrike15_v2_MatchInfo message.
 *
 * The bottom byte (gameType & 0xff) is the game mode, usually 8 for official competitive matches and 10 for wingman
 * matches, the remaining 24-bits indicate the map (up to 1 << 23).
 * Maps values are hard coded in CSGO and may change between CSGO operations.
 * The only way to have accurate maps name is to update this file and publish a new CS:DM version when necessary.
 */
export function getMapName(gameType: number) {
  const map = (gameType >> 8) & 0xffffff;
  const gameMode = (gameType & 0xff) as GameMode;
  const competitiveMode: GameMode = 8;
  const wingmanMode: GameMode = 10;

  const mapping = {
    [1 << 0]: 'de_grail',
    [1 << 1]: 'de_dust2',
    [1 << 2]: 'de_train',
    [1 << 3]: 'de_ancient',
    [1 << 4]: 'de_inferno',
    [1 << 5]: 'de_nuke',
    [1 << 6]: 'de_vertigo',
    [1 << 7]: {
      [competitiveMode]: 'de_mirage',
      [wingmanMode]: 'de_palais',
    },
    [1 << 8]: 'cs_office',
    [1 << 9]: 'de_brewery',
    [1 << 10]: 'de_whistle',
    [1 << 11]: 'de_dogtown',
    [1 << 12]: 'de_cache',
    [1 << 13]: 'de_jura',
    [1 << 14]: 'de_edin',
    [1 << 15]: 'de_anubis',
    [1 << 16]: 'de_tuscan',
    [1 << 18]: 'de_basalt',
    [1 << 19]: 'cs_agency',
    [1 << 20]: 'de_overpass',
    [1 << 21]: 'de_cobblestone',
    [1 << 22]: 'de_canals',
  } as const;

  if (typeof mapping[map] === 'string') {
    return mapping[map];
  }

  return mapping[map][gameMode] ?? 'Unknown';
}
