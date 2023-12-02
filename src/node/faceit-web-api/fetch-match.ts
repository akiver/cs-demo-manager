import { FaceitUnauthorized } from './errors/faceit-unauthorized';
import type { FaceitResultDTO } from './faceit-result';
import { FaceitResourceNotFound } from './errors/faceit-resource-not-found';
import { FaceitForbiddenError } from './errors/faceit-forbidden-error';
import { FaceitApiError } from './errors/faceit-api-error';
import { FaceitInvalidRequest } from './errors/faceit-invalid-request';
import type { FaceitGameId } from './faceit-game-id';

type FaceitRosterV1DTO = {
  active_team_id: string;
  avatar: string;
  csgo_id: string;
  csgo_name: string;
  csgo_skill_level: number;
  csgo_skill_level_label: string;
  guid: string; // It's the player/account ID
  membership: { type: string };
  nickname: string;
};

type FaceitRosterDTO = {
  player_id: string;
  nickname: string;
  avatar: string;
  game_player_id: string;
  game_player_name: string;
  game_skill_level: number;
  anticheat_required: boolean;
};

type FaceitFactionCommonDTO = {
  faction_id: string;
  avatar: string;
  leader: string;
  name: string;
};

export type FaceitFactionDTO = FaceitFactionCommonDTO & {
  roster: FaceitRosterDTO[];
};

export type FaceitFactionV1DTO = FaceitFactionCommonDTO & {
  roster_v1: FaceitRosterV1DTO[];
};

export type FaceitMatchDTO = {
  demo_url?: string[];
  faceit_url: string;
  game: FaceitGameId;
  match_id: string;
  results: FaceitResultDTO;
  started_at: number;
  finished_at: number;
  status: string;
  teams: {
    faction1: FaceitFactionDTO | FaceitFactionV1DTO;
    faction2: FaceitFactionDTO | FaceitFactionV1DTO;
  };
};

export async function fetchMatch(matchId: string, apiKey?: string) {
  const response = await fetch(`https://open.faceit.com/data/v4/matches/${matchId}`, {
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

  const match: FaceitMatchDTO = await response.json();

  return match;
}
