import { AnalysisStatus } from 'csdm/common/types/analysis-status';

export function isAnalysisErrorStatus(status: AnalysisStatus) {
  return status === AnalysisStatus.InsertError || status === AnalysisStatus.AnalyzeError;
}

export function isAnalysisInProgressStatus(status: AnalysisStatus) {
  return (
    status === AnalysisStatus.Pending || status === AnalysisStatus.Analyzing || status === AnalysisStatus.Inserting
  );
}

export function isAnalysisDoneStatus(status: AnalysisStatus) {
  return (
    status !== AnalysisStatus.AnalyzeError &&
    status !== AnalysisStatus.InsertSuccess &&
    status !== AnalysisStatus.InsertError
  );
}
