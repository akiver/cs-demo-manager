export const TriStateFilter = {
  All: 'all',
  Yes: 'yes',
  No: 'no',
} as const;
export type TriStateFilter = (typeof TriStateFilter)[keyof typeof TriStateFilter];
