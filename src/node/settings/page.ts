export const Page = {
  Download: 'download',
  Demos: 'demos',
  Matches: 'matches',
  Players: 'players',
  Teams: 'teams',
} as const;

export type Page = (typeof Page)[keyof typeof Page];
