import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ExternalLink } from 'csdm/ui/components/external-link';

export function FaceitDownloadsWarning() {
  return (
    <div className="flex items-center gap-x-8">
      <ExclamationTriangleIcon className="size-32 text-red-700" />
      <div>
        <p className="selectable">
          <Trans>
            FACEIT restricted demo downloads through a{' '}
            <ExternalLink href="https://docs.faceit.com/getting-started/Guides/download-api">private API</ExternalLink>{' '}
            and recently gave us a server-side API key with the maximum rate limit.
          </Trans>
        </p>
        <p className="selectable">
          <Trans>
            You <strong>don't have to ask</strong> FACEIT for an API key. It requires some work, but demo downloads will
            be back in a near future.
          </Trans>
        </p>
        <p className="selectable">
          <Trans>In the meantime, you have to download demos from your browser.</Trans>
        </p>
      </div>
    </div>
  );
}
