import type { FaceitAccountRow } from './faceit-account-row';
import type { FaceitAccount } from '../../../common/types/faceit-account';

export function faceitAccountRowToFaceitAccount(row: FaceitAccountRow): FaceitAccount {
  return {
    id: row.id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    isCurrent: row.is_current,
  };
}
