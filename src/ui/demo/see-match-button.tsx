import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useIsDemoAnalysisInProgress } from 'csdm/ui/analyses/use-is-demo-analysis-in-progress';
import { useCurrentDemo } from './use-current-demo';
import { useIsDemoInDatabase } from './use-is-demo-in-database';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import { Tooltip } from 'csdm/ui/components/tooltip';

export function SeeMatchButton() {
  const navigateToMatch = useNavigateToMatch();
  const isDemoAnalysisInProgress = useIsDemoAnalysisInProgress();
  const demo = useCurrentDemo();
  const isDemoInDatabase = useIsDemoInDatabase();

  const onClick = () => {
    navigateToMatch(demo.checksum);
  };

  let isDisabled = false;
  let tooltip: ReactNode | undefined;

  if (isDemoAnalysisInProgress(demo.checksum)) {
    isDisabled = true;
    tooltip = <Trans context="Tooltip">Demo analysis in progress.</Trans>;
  } else if (!isDemoInDatabase(demo.checksum)) {
    isDisabled = true;
    tooltip = <Trans context="Tooltip">This demo has not been analyzed yet.</Trans>;
  }

  const button = (
    <Button onClick={onClick} variant={ButtonVariant.Primary} isDisabled={isDisabled}>
      <Trans context="Button">See match</Trans>
    </Button>
  );

  if (isDisabled) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
}
