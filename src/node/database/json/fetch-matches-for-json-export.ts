import type { MatchJson } from 'csdm/node/json/match-json';
import { db } from 'csdm/node/database/database';
import { fetchCollateralKillCountPerMatch } from 'csdm/node/database/matches/fetch-collateral-kill-count-per-match';
import { fetchMatchTeamA } from 'csdm/node/database/matches/fetch-match-team-a';
import { fetchMatchTeamB } from 'csdm/node/database/matches/fetch-match-team-b';
import { matchRowToMatch } from 'csdm/node/database/matches/match-row-to-match';
import { fetchMatchPlayers } from 'csdm/node/database/match-players/fetch-match-players';
import { fetchRounds } from 'csdm/node/database/rounds/fetch-rounds';
import { fetchKills } from 'csdm/node/database/kills/fetch-kills';
import { fetchClutches } from 'csdm/node/database/clutches/fetch-cluches';
import { fetchBombsPlanted } from 'csdm/node/database/bomb-planted/fetch-bombs-planted';
import { fetchBombsDefused } from 'csdm/node/database/bomb-defused/fetch-bombs-defused';
import { fetchBombsExploded } from 'csdm/node/database/bomb-exploded/fetch-bombs-exploded';
import { fetchDamages } from 'csdm/node/database/damages/fetch-damages';
import { fetchPlayerBlinds } from 'csdm/node/database/player-blinds/fetch-player-blinds';
import { fetchPlayersEconomies } from 'csdm/node/database/player-economies/fetch-player-economies';
import { fetchShots } from 'csdm/node/database/shots/fetch-shots';
import { fetchChatMessages } from 'csdm/node/database/chat-messages/fetch-chat-messages';
import { fetchChickenDeaths } from 'csdm/node/database/chicken-death/fetch-chicken-deaths';
import { fetchGrenadeProjectileDestroy } from 'csdm/node/database/grenade-projectile-destroy/fetch-grenade-projectiles-destroy';

export async function fetchMatchesForJsonExport(checksums: string[]): Promise<MatchJson[]> {
  const rows = await db
    .selectFrom('matches')
    .selectAll('matches')
    .leftJoin('comments', 'comments.checksum', 'matches.checksum')
    .select('comments.comment')
    .where('matches.checksum', 'in', checksums)
    .execute();

  const collateralKillCountPerMatch = await fetchCollateralKillCountPerMatch();

  const matches: MatchJson[] = [];
  for (const row of rows) {
    const { checksum, comment } = row;
    const [teamA, teamB] = await Promise.all([fetchMatchTeamA(checksum), fetchMatchTeamB(checksum)]);
    const match = (await matchRowToMatch(row, teamA, teamB, collateralKillCountPerMatch, comment)) as MatchJson;
    const [
      players,
      rounds,
      kills,
      clutches,
      bombsPlanted,
      bombsDefused,
      bombsExploded,
      damages,
      blinds,
      playersEconomies,
      shots,
      chatMessages,
      chickenDeaths,
      grenadeDestroyed,
    ] = await Promise.all([
      fetchMatchPlayers(checksum),
      fetchRounds(checksum),
      fetchKills(checksum),
      fetchClutches(checksum),
      fetchBombsPlanted(checksum),
      fetchBombsDefused(checksum),
      fetchBombsExploded(checksum),
      fetchDamages(checksum),
      fetchPlayerBlinds(checksum),
      fetchPlayersEconomies(checksum),
      fetchShots({
        checksum,
      }),
      fetchChatMessages(checksum),
      fetchChickenDeaths(checksum),
      fetchGrenadeProjectileDestroy(checksum),
    ]);

    match.players = players;
    match.rounds = rounds;
    match.kills = kills;
    match.clutches = clutches;
    match.bombsPlanted = bombsPlanted;
    match.bombsDefused = bombsDefused;
    match.bombsExploded = bombsExploded;
    match.damages = damages;
    match.blinds = blinds;
    match.playersEconomies = playersEconomies;
    match.shots = shots;
    match.chatMessages = chatMessages;
    match.chickenDeaths = chickenDeaths;
    match.grenadeDestroyed = grenadeDestroyed;
    matches.push(match);
  }

  return matches;
}
