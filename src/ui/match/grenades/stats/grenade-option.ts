import { GrenadeName } from 'csdm/common/types/counter-strike';

export const GrenadeOption = {
  Flashbang: 'flashbang',
  HE: 'he',
  Fire: 'fire',
  Smoke: 'smoke',
} as const;

export type GrenadeOption = (typeof GrenadeOption)[keyof typeof GrenadeOption];

export function getGrenadeOptionNames(grenade: GrenadeOption): GrenadeName[] {
  switch (grenade) {
    case GrenadeOption.Flashbang:
      return [GrenadeName.Flashbang];
    case GrenadeOption.HE:
      return [GrenadeName.HE];
    case GrenadeOption.Fire:
      return [GrenadeName.Molotov, GrenadeName.Incendiary];
    case GrenadeOption.Smoke:
      return [GrenadeName.Smoke];
  }
}
