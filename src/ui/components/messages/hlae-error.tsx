import { Trans } from '@lingui/react/macro';
import React from 'react';
import { ExternalLink } from '../external-link';

export function HlaeError() {
  return (
    <div className="flex flex-col gap-x-4">
      <span>
        <Trans>HLAE returned an error.</Trans>
      </span>
      <span>
        <Trans>
          Make sure HLAE is up to date and compatible with the last CS2 version on{' '}
          <ExternalLink href="https://github.com/advancedfx/advancedfx/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen">
            GitHub
          </ExternalLink>{' '}
          or <ExternalLink href="https://discord.com/invite/NGp8qhN">Discord</ExternalLink>.
        </Trans>
      </span>
    </div>
  );
}
