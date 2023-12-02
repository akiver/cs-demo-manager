import { useMatchChecksums } from 'csdm/ui/cache/use-match-checksums';
import { useAnalyses } from 'csdm/ui/analyses/use-analyses';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';

export function useGetDemoAnalysisStatus() {
  const analyses = useAnalyses();
  const matchChecksums = useMatchChecksums();

  return (checksum: string): AnalysisStatus | undefined => {
    const analysis = analyses.find((analysis) => analysis.demoChecksum === checksum);

    if (analysis !== undefined) {
      return analysis.status;
    }

    if (matchChecksums.includes(checksum)) {
      return AnalysisStatus.InsertSuccess;
    }

    return undefined;
  };
}
