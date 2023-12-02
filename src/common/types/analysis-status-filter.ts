export const AnalysisStatusFilter = {
  All: 'all',
  NotInDatabase: 'not-in-database',
  Pending: 'pending',
  InProgress: 'in-progress',
  InDatabase: 'in-database',
  Error: 'error',
} as const;

export type AnalysisStatusFilter = (typeof AnalysisStatusFilter)[keyof typeof AnalysisStatusFilter];
