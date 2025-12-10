import { getSettings } from 'csdm/node/settings/get-settings';
import type { RenownPlayer } from 'csdm/common/types/renown-match';
import { type RenownMatch } from 'csdm/common/types/renown-match';
import { RenownResourceNotFound } from './errors/renown-resource-not-found';
import { getDownloadStatus } from '../download/get-download-status';
import { Game } from 'csdm/common/types/counter-strike';
import { roundNumber } from 'csdm/common/math/round-number';
import { assertValidRenownResponse } from './assert-valid-renown-response';

// There is an OpenAPI spec available at https://renown.gg/api-docs.
type ResponsePayload<DataType> = {
  data: DataType;
};

type TeamDTO = {
  name: string;
  score: number;
  starting_side: 'CT' | 'T';
};

type PlayerDTO = {
  steam_id: string;
  nickname: string | null;
  steam_avatar: string;
  team: string;
  leetify_rating: number | null;
  adr: number;
  kills: number;
  assists: number;
  deaths: number;
  mvps: number;
  two_ks: number;
  three_ks: number;
  four_ks: number;
  five_ks: number;
  kills_with_headshot: number;
  headshot_percentage: number;
  damage_dealt: number;
  utility_damage: number;
  elo_before: number | null;
  elo_change: number | null;
};

type MatchDTO = {
  match_id: number;
  started_at: string;
  finished_at: string;
  demo_url: string | null;
  winning_team: string;
  team1: TeamDTO;
  team2: TeamDTO;
  map: {
    name: 'de_mirage';
  } | null;
  players: PlayerDTO[];
  leetify_match_id: string | null;
};

type ListMatchDTO = {
  match_id: number;
};

async function fetchLastMatchesIds(steamId: string) {
  const maxMatchCount = 20;
  // https://renown.gg/api-docs#tag/players/get/v1/player/{steam_id}
  const response = await fetch(
    `https://api.renown.gg/v1/player/${steamId}/matches?page=1&limit=${maxMatchCount}&status=FINISHED`,
  );

  assertValidRenownResponse(response);

  const data: ResponsePayload<ListMatchDTO[]> = await response.json();
  const matchIds = data.data.map((match) => match.match_id);

  return matchIds;
}

async function fetchMatchDetails(matchId: number, downloadFolderPath: string | undefined): Promise<RenownMatch> {
  // https://renown.gg/api-docs#tag/matches/get/v1/match/{match_id}
  const response = await fetch(`https://api.renown.gg/v1/match/${matchId}`);

  assertValidRenownResponse(response);

  const match: MatchDTO = await response.json();
  const demoUrl = match.demo_url ?? '';

  return {
    game: Game.CS2,
    id: matchId.toString(),
    downloadStatus: await getDownloadStatus(downloadFolderPath, matchId, demoUrl),
    date: new Date(match.finished_at).toISOString(),
    demoUrl: demoUrl,
    durationInSeconds: (new Date(match.finished_at).getTime() - new Date(match.started_at).getTime()) / 1000,
    mapName: match.map?.name ?? 'unknown',
    players: match.players.map<RenownPlayer>((player) => {
      return {
        steamId: player.steam_id,
        name: player.nickname ?? 'Unknown',
        avatarUrl: player.steam_avatar,
        teamName: player.team,
        adr: player.adr,
        killCount: player.kills,
        assistCount: player.assists,
        deathCount: player.deaths,
        killDeathRatio: roundNumber(Number(player.kills) / Number(player.deaths), 1),
        mvpCount: player.mvps,
        threeKillCount: player.three_ks,
        fourKillCount: player.four_ks,
        fiveKillCount: player.five_ks,
        headshotCount: player.kills_with_headshot,
        headshotPercentage: player.headshot_percentage,
        damageDealt: player.damage_dealt,
        utilityDamage: player.utility_damage,
        eloBefore: player.elo_before,
        eloChange: player.elo_change,
        leetifyRating: player.leetify_rating,
      };
    }),
    team1: match.team1,
    team2: match.team2,
    winnerTeamName: match.winning_team,
    url: `https://renown.gg/match/${matchId}`,
    leetifyMatchUrl: match.leetify_match_id ? `https://leetify.com/app/match-details/${match.leetify_match_id}` : null,
  };
}

export async function fetchLastRenownMatches(steamId: string) {
  const matches: RenownMatch[] = [];
  const matchIds = await fetchLastMatchesIds(steamId);

  if (matchIds.length === 0) {
    return matches;
  }

  const settings = await getSettings();
  const downloadFolderPath = settings.download.folderPath;

  const results = await Promise.all(
    matchIds.map(async (matchId) => {
      try {
        return await fetchMatchDetails(matchId, downloadFolderPath);
      } catch (error) {
        if (!(error instanceof RenownResourceNotFound)) {
          logger.log(`Renown match with ID ${matchId} not found`);
          throw error;
        }
        return null;
      }
    }),
  );

  return results.filter((match) => match !== null);
}
