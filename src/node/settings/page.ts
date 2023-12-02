export const Page = {
  Matches: 'matches',
  Demos: 'demos',
  Players: 'players',
  Download: 'download',
} as const;

export type Page = (typeof Page)[keyof typeof Page];
