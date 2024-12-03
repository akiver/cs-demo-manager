import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { CenteredContent } from 'csdm/ui/components/content';

type Props = {
  onContinueClick: () => void;
};

export function FetchMatchesConfirmation({ onContinueClick }: Props) {
  return (
    <CenteredContent>
      <p className="text-subtitle mb-12">
        <Trans>It will close Counter-Strike if it's running and start automatically for a few seconds.</Trans>
      </p>
      <Button onClick={onContinueClick} variant={ButtonVariant.Primary}>
        <Trans>Continue</Trans>
      </Button>
    </CenteredContent>
  );
}
