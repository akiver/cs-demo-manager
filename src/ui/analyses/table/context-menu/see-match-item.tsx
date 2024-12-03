import React from 'react';
import { Trans } from '@lingui/react/macro';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import { useSelectedAnalysis } from 'csdm/ui/analyses/use-selected-analysis-demo-id';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';

export function SeeMatchItem() {
  const selectedAnalysis = useSelectedAnalysis();
  const navigateToMatch = useNavigateToMatch();
  const onClick = () => {
    if (selectedAnalysis === undefined) {
      return;
    }
    navigateToMatch(selectedAnalysis.demoChecksum);
  };
  const isDisabled = selectedAnalysis === undefined || selectedAnalysis.status !== AnalysisStatus.InsertSuccess;

  return (
    <ContextMenuItem onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Context menu">See match</Trans>
    </ContextMenuItem>
  );
}
