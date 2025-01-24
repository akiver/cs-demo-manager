import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExternalLink } from './external-link';

export function Donate() {
  return (
    <div className="flex flex-col">
      <h3 className="text-subtitle">
        <Trans>Donate</Trans>
      </h3>
      <p>
        <Trans>
          CS Demo Manager is a project that I started during college in 2014 and maintained as much as I can since then.
        </Trans>
      </p>
      <p>
        <Trans>
          It's not backed by any corporate entity and is a free and open-source software that I hope you enjoy using.
        </Trans>
      </p>
      <p>
        <Trans>
          Your <ExternalLink href="https://cs-demo-manager.com/download">donation</ExternalLink> is greatly appreciated
          and motivates me to continue working on CS Demo Manager. Thank you!
        </Trans>
      </p>
    </div>
  );
}
