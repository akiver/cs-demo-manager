import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import type { Demo } from 'csdm/common/types/demo';
import { Button } from './button';
import { useProcessDemosToAnalyze } from 'csdm/ui/hooks/use-process-demos-to-analyze';

type Props = {
  demos: Demo[];
  isDisabled?: boolean;
  children?: ReactNode;
};

export function AnalyzeButton({ demos, isDisabled, children }: Props) {
  const processDemosToAnalyze = useProcessDemosToAnalyze();

  if (demos.length === 0) {
    return null;
  }

  const onClick = async () => {
    await processDemosToAnalyze(demos);
  };

  return (
    <>
      <Button onClick={onClick} isDisabled={isDisabled}>
        {children ?? <Trans context="Button">Analyze</Trans>}
      </Button>
    </>
  );
}
