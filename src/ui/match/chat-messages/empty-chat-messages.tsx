import React from 'react';
import { Trans } from '@lingui/macro';
import { DemoSource } from 'csdm/common/types/counter-strike';
import { CenteredContent } from 'csdm/ui/components/content';
import { useCurrentMatch } from '../use-current-match';

export function EmptyChatMessages() {
  const match = useCurrentMatch();

  return (
    <CenteredContent>
      <p className="text-subtitle">
        <Trans>No chat messages found.</Trans>
      </p>
      {match.source === DemoSource.Valve && (
        <p>
          <Trans>
            Chat messages are available only if the <code>.info</code> file of the demo is next to its <code>.dem</code>{' '}
            file during analysis.
          </Trans>
        </p>
      )}
    </CenteredContent>
  );
}
