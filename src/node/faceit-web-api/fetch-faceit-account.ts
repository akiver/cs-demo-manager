import { FaceitApiError } from './errors/faceit-api-error';
import { FaceitForbiddenError } from './errors/faceit-forbidden-error';
import { FaceitUnauthorized } from './errors/faceit-unauthorized';
import { getFaceitApiKey } from './get-faceit-api-key';
import { FaceitResourceNotFound } from './errors/faceit-resource-not-found';
import { FaceitInvalidRequest } from './errors/faceit-invalid-request';

type FaceitGameDTO = {
  region: string;
  game_player_id: string;
  skill_level: number;
  faceit_elo: number;
  game_player_name: string;
  skill_level_label: string;
  game_profile_id: string;
};

export type FaceitAccountDTO = {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  cover_image: string;
  platforms: { [platformName: string]: string };
  games: { [gameId: string]: FaceitGameDTO };
  settings: {
    language: string;
  };
  friends_ids: string[];
  new_steam_id: string;
  steam_id_64: string;
  steam_nickname: string;
  memberships: string[];
  faceit_url: string;
  membership_type: string;
  cover_featured_image: string;
  infractions: Record<string, unknown>;
};

export async function fetchFaceitAccount(nickname: string) {
  const apiKey = await getFaceitApiKey();
  const response = await fetch(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
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

  const account: FaceitAccountDTO = await response.json();

  return account;
}
