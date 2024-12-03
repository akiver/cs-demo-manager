import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CenteredContent } from 'csdm/ui/components/content';
import { RetryButton } from 'csdm/ui/components/buttons/retry-button';

type Props = {
  onRetryClick: () => void;
};

export function NoMatchesFound({ onRetryClick }: Props) {
  return (
    <CenteredContent>
      <p className="text-subtitle mb-12">
        <Trans>No matches found for the current Steam account.</Trans>
      </p>
      <RetryButton onClick={onRetryClick} />
    </CenteredContent>
  );
}
