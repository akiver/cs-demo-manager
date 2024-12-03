import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Demo } from 'csdm/common/types/demo';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useProcessDemosToAnalyze } from 'csdm/ui/hooks/use-process-demos-to-analyze';

type Props = {
  demos: Demo[];
};

export function AnalyzeItem({ demos }: Props) {
  const isDisabled = demos.length === 0;
  const processDemosToAnalyze = useProcessDemosToAnalyze();
  const onClick = () => {
    processDemosToAnalyze(demos);
  };

  return (
    <ContextMenuItem onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Context menu">Analyze</Trans>
    </ContextMenuItem>
  );
}
