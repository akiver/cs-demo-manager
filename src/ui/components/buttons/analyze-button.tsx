import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Demo } from 'csdm/common/types/demo';
import { Button } from './button';
import { useProcessDemosToAnalyze } from 'csdm/ui/hooks/use-process-demos-to-analyze';
import { useIsDemoAnalysisInProgress } from 'csdm/ui/analyses/use-is-demo-analysis-in-progress';

type Props = {
  demos: Demo[];
  isDisabled?: boolean;
};

export function AnalyzeButton({ demos, isDisabled }: Props) {
  const processDemosToAnalyze = useProcessDemosToAnalyze();
  const isDemoAnalysisInProgress = useIsDemoAnalysisInProgress();

  if (demos.length === 0) {
    return null;
  }

  const onClick = () => {
    processDemosToAnalyze(demos);
  };

  return (
    <>
      <Button onClick={onClick} isDisabled={isDisabled ?? isDemoAnalysisInProgress(demos[0].checksum)}>
        <Trans context="Button">Analyze</Trans>
      </Button>
    </>
  );
}
