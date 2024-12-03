import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { CenteredContent } from 'csdm/ui/components/content';

export function UnsupportedMap() {
  return (
    <CenteredContent>
      <p className="text-subtitle">
        <Trans>Map not supported.</Trans>
      </p>
      <p>
        <Trans>
          You can add custom maps from settings, please read the
          <ExternalLink href="https://cs-demo-manager.com/docs/guides/maps"> documentation </ExternalLink>
          for more details.
        </Trans>
      </p>
    </CenteredContent>
  );
}
