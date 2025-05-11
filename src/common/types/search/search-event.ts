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
  TeamKills: 'team-kills',
  NoScopeKills: 'no-scope-kills',
  ThroughSmokeKills: 'through-smoke-kills',
  RoundStart: 'round-start',
} as const;

export type SearchEvent = (typeof SearchEvent)[keyof typeof SearchEvent];
