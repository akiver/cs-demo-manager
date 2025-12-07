import { db } from '../database';
import type { RenownAccount } from 'csdm/common/types/renown-account';
import { fetchRenownAccount, type RenownAccountDTO } from 'csdm/node/renown/fetch-renown-account-from-steamid';
import { fetchRenownAccounts } from './fetch-renown-accounts';

async function buildAccountFromDTO(account: RenownAccountDTO): Promise<RenownAccount> {
  const currentAccounts = await fetchRenownAccounts();
  return {
    id: account.steam_id,
    nickname: account.nickname,
    avatarUrl: account.steam_avatar,
    isCurrent: currentAccounts.length === 0,
  };
}

export async function addRenownAccount(steamId: string) {
  const accountDTO = await fetchRenownAccount(steamId);
  const account = await buildAccountFromDTO(accountDTO);
  await db
    .insertInto('renown_accounts')
    .values({
      steam_id: account.id,
      nickname: account.nickname,
      avatar_url: account.avatarUrl,
      is_current: account.isCurrent,
    })
    .execute();

  return account;
}
