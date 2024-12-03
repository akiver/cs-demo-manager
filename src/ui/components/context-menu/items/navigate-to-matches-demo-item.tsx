import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';
import type { MatchTable } from 'csdm/common/types/match-table';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  matches: MatchTable[];
};

export function NavigateToMatchesDemoItem({ matches }: Props) {
  const navigateToDemo = useNavigateToDemo();
  const isDisabled = matches.length !== 1;

  const onClick = () => {
    const [match] = matches;
    navigateToDemo(match.demoFilePath, {
      state: {
        siblingDemoPaths: matches.map((match) => match.demoFilePath),
        checksum: match.checksum,
      },
    });
  };

  return (
    <ContextMenuItem isDisabled={isDisabled} onClick={onClick}>
      <Trans context="Context menu">See demo</Trans>
    </ContextMenuItem>
  );
}
