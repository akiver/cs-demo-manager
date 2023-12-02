import { useAnalyses } from './use-analyses';
import { isAnalysisInProgressStatus } from 'csdm/ui/analyses/analysis-status';

export function useIsDemoAnalysisInProgress() {
  const analyses = useAnalyses();

  return (checksum: string) => {
    const isDemoInPendingAnalyses = analyses.some((analysis) => {
      return analysis.demoChecksum === checksum && isAnalysisInProgressStatus(analysis.status);
    });

    return isDemoInPendingAnalyses;
  };
}
