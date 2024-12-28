import type { FiveEPlayAccountRow } from './5eplay-account-row';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';

export function fiveEPlayAccountRowTo5EPlayAccount(row: FiveEPlayAccountRow): FiveEPlayAccount {
  return {
    id: row.id,
    domainId: row.domain_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    isCurrent: row.is_current,
  };
}
