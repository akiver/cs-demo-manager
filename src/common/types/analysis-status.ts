export const AnalysisStatus = {
  Pending: 'pending',
  Analyzing: 'analyzing',
  AnalyzeError: 'analyze-error',
  AnalyzeSuccess: 'analyze-success',
  Inserting: 'inserting-match',
  InsertError: 'insert-error',
  InsertSuccess: 'insert-success',
} as const;

export type AnalysisStatus = (typeof AnalysisStatus)[keyof typeof AnalysisStatus];
