export const SearchEvent = {
  Kills: 'kills',
  FiveKill: 'five-kill',
  FourKill: 'four-kill',
  OneVsFive: 'one-vs-five',
  OneVsFour: 'one-vs-four',
  OneVsThree: 'one-vs-three',
  NinjaDefuse: 'ninja-defuse',
  RoundStart: 'round-start',
} as const;

export type SearchEvent = (typeof SearchEvent)[keyof typeof SearchEvent];
