import { db } from '../database';
import { fetch5EPlayAccount, type FiveEPlayAccountDTO } from 'csdm/node/5eplay/fetch-5eplay-player-account-from-domain';
import { fetch5EPlayAccounts } from './fetch-5eplay-accounts';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';

async function buildAccountFromDTO(domainId: string, account: FiveEPlayAccountDTO): Promise<FiveEPlayAccount> {
  const currentAccounts = await fetch5EPlayAccounts();
  return {
    id: account.id,
    domainId,
    nickname: account.username,
    avatarUrl: account.avatarUrl,
    isCurrent: currentAccounts.length === 0,
  };
}

export async function add5EPlayAccount(domainId: string) {
  const accountDTO = await fetch5EPlayAccount(domainId);
  const account = await buildAccountFromDTO(domainId, accountDTO);
  await db
    .insertInto('5eplay_accounts')
    .values({
      id: account.id,
      domain_id: domainId,
      nickname: account.nickname,
      avatar_url: account.avatarUrl,
      is_current: account.isCurrent,
    })
    .execute();

  return account;
}
