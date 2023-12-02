export const BanFilter = {
  None: 'none',
  VacBanned: 'vacBanned',
  GameBanned: 'gameBanned',
  CommunityBanned: 'communityBanned',
} as const;

export type BanFilter = (typeof BanFilter)[keyof typeof BanFilter];
