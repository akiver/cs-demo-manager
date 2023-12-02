import React from 'react';
import { useAnalyses } from 'csdm/ui/analyses/use-analyses';
import { NumberBadge } from '../components/number-badge';
import { LeftBarBadge } from './left-bar-badge';
import { isAnalysisDoneStatus } from '../analyses/analysis-status';

export function PendingAnalysesBadge() {
  const analyses = useAnalyses();
  const analysesNotDone = analyses.filter((analysis) => {
    return isAnalysisDoneStatus(analysis.status);
  });

  return (
    <LeftBarBadge>
      <NumberBadge number={analysesNotDone.length} />
    </LeftBarBadge>
  );
}
