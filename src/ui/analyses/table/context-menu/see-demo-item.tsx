import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useSelectedAnalysis } from 'csdm/ui/analyses/use-selected-analysis-demo-id';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';

export function SeeDemoItem() {
  const selectedAnalysis = useSelectedAnalysis();
  const navigateToDemo = useNavigateToDemo();
  const onClick = () => {
    if (selectedAnalysis === undefined) {
      return;
    }
    navigateToDemo(selectedAnalysis.demoPath);
  };
  const isDisabled = selectedAnalysis === undefined;

  return (
    <ContextMenuItem onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Context menu">See demo</Trans>
    </ContextMenuItem>
  );
}
