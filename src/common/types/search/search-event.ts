export const SearchEvent = {
  FiveKill: 'five-kill',
  FourKill: 'four-kill',
  OneVsFive: 'one-vs-five',
  OneVsFour: 'one-vs-four',
  OneVsThree: 'one-vs-three',
  WallbangKills: 'wallbang-kills',
  CollateralKills: 'collateral-kills',
  KnifeKills: 'knife-kills',
  NinjaDefuse: 'ninja-defuse',
  JumpKills: 'jump-kills',
} as const;

export type SearchEvent = (typeof SearchEvent)[keyof typeof SearchEvent];
