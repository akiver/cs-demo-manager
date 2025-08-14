import type { DemoSource, WeaponName } from 'csdm/common/types/counter-strike';

export type SearchFilter = {
  steamIds: string[];
  victimSteamIds: string[];
  mapNames: string[];
  startDate: string | undefined;
  endDate: string | undefined;
  demoSources: DemoSource[];
  weaponNames: WeaponName[];
  roundTagIds: string[];
  matchTagIds: string[];
};
