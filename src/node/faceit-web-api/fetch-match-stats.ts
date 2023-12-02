import { FaceitUnauthorized } from './errors/faceit-unauthorized';
import { FaceitResourceNotFound } from './errors/faceit-resource-not-found';
import { FaceitForbiddenError } from './errors/faceit-forbidden-error';
import { FaceitApiError } from './errors/faceit-api-error';
import { FaceitInvalidRequest } from './errors/faceit-invalid-request';

type FaceitPlayerStatsDTO = {
  Assists: string;
  Deaths: string;
  Headshots: string;
  'Headshots %': string;
  'K/D Ratio': string;
  'K/R Ratio': string;
  Kills: string;
  MVPs: string;
  'Penta Kills': string;
  'Quadro Kills': string;
  Result: string;
  'Triple Kills': string;
};

type FaceitPlayerDTO = {
  nickname: string;
  player_id: string;
  player_stats: FaceitPlayerStatsDTO;
};

type FaceitTeamStatsDTO = {
  'Final Score': string;
  'First Half Score': string;
  'Overtime score': string;
  'Second Half Score': string;
  Team: string; // Team name
  'Team Headshots': string;
  'Team Win': string;
};

type FaceitTeamDTO = {
  team_id: string;
  team_stats: FaceitTeamStatsDTO;
  players: FaceitPlayerDTO[];
};

type FaceitRoundStatsDTO = {
  game_mode: string;
  round_stats: {
    Map: string;
    Winner: string;
  };
  teams: FaceitTeamDTO[];
};

export type FaceitMatchStatsDTO = {
  rounds: FaceitRoundStatsDTO[];
};

export async function fetchFaceitMatchStats(matchId: string, apiKey?: string) {
  const response = await fetch(`https://open.faceit.com/data/v4/matches/${matchId}/stats`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new FaceitUnauthorized();
  }

  if (response.status === 404) {
    throw new FaceitResourceNotFound();
  }

  if (response.status === 403) {
    throw new FaceitForbiddenError();
  }

  if (response.status === 400) {
    throw new FaceitInvalidRequest();
  }

  if (response.status !== 200) {
    throw new FaceitApiError(response.status);
  }

  const stats: FaceitMatchStatsDTO = await response.json();

  return stats;
}
