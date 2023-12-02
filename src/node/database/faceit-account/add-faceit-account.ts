import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import { fetchFaceitAccounts } from 'csdm/node/database/faceit-account/fetch-faceit-accounts';
import { db } from '../database';
import type { FaceitAccountDTO } from 'csdm/node/faceit-web-api/fetch-faceit-account';
import { fetchFaceitAccount } from 'csdm/node/faceit-web-api/fetch-faceit-account';

async function buildAccountFromFaceitDTO(accountDTO: FaceitAccountDTO): Promise<FaceitAccount> {
  const currentAccounts = await fetchFaceitAccounts();
  return {
    id: accountDTO.player_id,
    nickname: accountDTO.nickname,
    avatarUrl: accountDTO.avatar,
    isCurrent: currentAccounts.length === 0,
  };
}

export async function addFaceitAccount(nickname: string) {
  const accountDTO: FaceitAccountDTO = await fetchFaceitAccount(nickname);
  const account = await buildAccountFromFaceitDTO(accountDTO);
  await db
    .insertInto('faceit_accounts')
    .values({
      id: account.id,
      nickname: account.nickname,
      avatar_url: account.avatarUrl,
      is_current: account.isCurrent,
    })
    .execute();

  return account;
}
