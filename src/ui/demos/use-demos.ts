import type { Demo } from 'csdm/common/types/demo';
import { useDemosState } from './use-demos-state';
import { useDemosSettings } from 'csdm/ui/settings/use-demos-settings';
import { AnalysisStatusFilter } from 'csdm/common/types/analysis-status-filter';
import { useGetDemoAnalysisStatus } from 'csdm/ui/analyses/use-get-demo-analysis-status';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import { isAnalysisErrorStatus, isAnalysisInProgressStatus } from '../analyses/analysis-status';

export function useDemos(): Demo[] {
  const demosState = useDemosState();
  const getDemoAnalysisStatus = useGetDemoAnalysisStatus();
  const { analysisStatus } = useDemosSettings();

  if (analysisStatus === AnalysisStatusFilter.All) {
    return demosState.entities;
  }

  return demosState.entities.filter((demo) => {
    const status = getDemoAnalysisStatus(demo.checksum);
    if (status === undefined) {
      return analysisStatus === AnalysisStatusFilter.NotInDatabase;
    }

    if (analysisStatus === AnalysisStatusFilter.InProgress && isAnalysisInProgressStatus(status)) {
      return true;
    }

    if (analysisStatus === AnalysisStatusFilter.Pending && status === AnalysisStatus.Pending) {
      return true;
    }

    if (analysisStatus === AnalysisStatusFilter.Error && isAnalysisErrorStatus(status)) {
      return true;
    }

    if (analysisStatus === AnalysisStatusFilter.InDatabase && status === AnalysisStatus.InsertSuccess) {
      return true;
    }

    return false;
  });
}
