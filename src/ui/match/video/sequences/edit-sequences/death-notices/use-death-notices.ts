import { useContext } from 'react';
import { DeathNoticesContext } from './death-notices-provider';

export function useDeathNotices() {
  return useContext(DeathNoticesContext);
}
