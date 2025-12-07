import { assertValidRenownResponse } from './assert-valid-renown-response';

// https://renown.gg/api-docs#tag/players/get/v1/player/{steam_id}
export type RenownAccountDTO = {
  steam_id: string;
  nickname: string;
  steam_avatar: string;
};

export async function fetchRenownAccount(steamId: string): Promise<RenownAccountDTO> {
  const response = await fetch(`https://api.renown.gg/v1/player/${steamId}`);

  assertValidRenownResponse(response);

  const account: RenownAccountDTO = await response.json();

  return account;
}
