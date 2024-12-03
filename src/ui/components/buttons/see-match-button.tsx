import React from 'react';
import { Button } from './button';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import { Trans } from '@lingui/react/macro';

type Props = {
  checksum: string;
};

export function SeeMatchButton({ checksum }: Props) {
  const navigateToMatch = useNavigateToMatch();

  return (
    <Button
      onClick={() => {
        navigateToMatch(checksum);
      }}
    >
      <Trans context="Button">See match</Trans>
    </Button>
  );
}
