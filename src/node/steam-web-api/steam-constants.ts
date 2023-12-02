export const MAX_STEAM_IDS_PER_REQUEST = 100;

export const EconomyBan = {
  None: 'none',
  Probation: 'probation',
  Banned: 'banned',
} as const;

export type EconomyBan = (typeof EconomyBan)[keyof typeof EconomyBan];
