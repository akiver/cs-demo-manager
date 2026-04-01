import React from 'react';
import { Trans } from '@lingui/react/macro';
import { AnalyzeButton } from 'csdm/ui/components/buttons/analyze-button';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useDemos } from '../use-demos';

export function AnalyzeNotaAnalyzedDemosButton() {
  const demos = useDemos();
  const demosLoaded = useDemosLoaded();
  return (
    <AnalyzeButton isDisabled={!demosLoaded} demos={demos}>
      <Trans>Analyze all demos</Trans>
    </AnalyzeButton>
  );
}
