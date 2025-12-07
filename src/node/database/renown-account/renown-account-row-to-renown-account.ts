import type { RenownAccount } from 'csdm/common/types/renown-account';
import type { RenownAccountRow } from './renown-account-row';

export function renownAccountRowToRenownAccount(row: RenownAccountRow): RenownAccount {
  return {
    id: row.steam_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    isCurrent: row.is_current,
  };
}
