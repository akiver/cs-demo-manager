import React from 'react';
import { CenteredContent } from 'csdm/ui/components/content';
import { RetryButton } from 'csdm/ui/components/buttons/retry-button';

type Props = {
  error: string;
  onRetryClick: () => void;
};

export function FetchMatchesInfoError({ error, onRetryClick }: Props) {
  return (
    <CenteredContent>
      <p className="text-subtitle mb-8">{error}</p>
      <RetryButton onClick={onRetryClick} />
    </CenteredContent>
  );
}
