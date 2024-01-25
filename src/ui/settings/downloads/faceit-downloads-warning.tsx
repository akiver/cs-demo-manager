import React from 'react';
import { Trans } from '@lingui/macro';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ExternalLink } from 'csdm/ui/components/external-link';

export function FaceitDownloadsWarning() {
  return (
    <div className="flex items-center gap-x-8">
      <ExclamationTriangleIcon className="size-32 text-red-700" />
      <div>
        <p className="selectable">
          <Trans>
            FACEIT restricted demos download through a{' '}
            <ExternalLink href="https://docs.faceit.com/getting-started/Guides/download-api">private API</ExternalLink>{' '}
            that prevents us from downloading demos from CS:DM.
          </Trans>
        </p>
        <p className="selectable">
          <Trans>
            A request has been submitted to allow CS:DM. In the meantime, you have to download demos from your browser.
          </Trans>
        </p>
      </div>
    </div>
  );
}
