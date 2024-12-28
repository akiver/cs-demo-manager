import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExternalLink } from 'csdm/ui/components/external-link';

export function FiveEPlayAccountInstructions() {
  return (
    <div className="flex flex-col gap-y-8">
      <h2 className="text-title">
        <Trans>How can I find my 5EPlay ID?</Trans>
      </h2>
      <ol className="list-decimal list-inside">
        <li>
          <Trans>
            Log into your <ExternalLink href="https://www.5eplay.com/">5EPlay</ExternalLink> account.
          </Trans>
        </li>
        <li>
          <Trans>Go to your profile and copy the last segment of the URL.</Trans>

          <p>
            <Trans>
              For example, if the URL is <strong>https://arena.5eplay.com/data/player/111111</strong> then the ID is{' '}
              <strong>111111</strong>.
            </Trans>
          </p>
        </li>
      </ol>
    </div>
  );
}
