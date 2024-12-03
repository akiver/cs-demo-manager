import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Message } from 'csdm/ui/components/message';

type Props = {
  loadedDemoCount: number;
  demoToLoadCount: number;
};

export function LoadingDemosMessage({ loadedDemoCount, demoToLoadCount }: Props) {
  if (loadedDemoCount === 0 || demoToLoadCount === 0) {
    return <Message message={<Trans>Loading demos…</Trans>} />;
  }

  return (
    <Message
      message={
        <Trans>
          Loading {loadedDemoCount} of {demoToLoadCount} demos…
        </Trans>
      }
    />
  );
}
