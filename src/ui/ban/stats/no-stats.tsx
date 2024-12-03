import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CenteredContent } from 'csdm/ui/components/content';

export function NoStats() {
  return (
    <CenteredContent>
      <p className="text-subtitle">
        <Trans>No VAC ban stats to show, you must analyze demos to generate stats.</Trans>
      </p>
    </CenteredContent>
  );
}
