import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExternalLink } from 'csdm/ui/components/external-link';

function getDocumentationLink() {
  let platform = 'windows';
  if (window.csdm.isMac) {
    platform = 'macos';
  } else if (window.csdm.isLinux) {
    platform = 'linux';
  }

  return `https://cs-demo-manager.com/docs/installation#${platform}`;
}

export function HelpLink() {
  const docLink = getDocumentationLink();

  return (
    <p>
      <Trans>Please read the {<ExternalLink href={docLink}>documentation</ExternalLink>} for help.</Trans>
    </p>
  );
}
