import { Trans } from '@lingui/react/macro';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import React from 'react';

export function Cs2HighlightsWarning() {
  return (
    <div className="flex items-center gap-x-4">
      <ExclamationTriangleIcon className="size-12 shrink-0 text-orange-700" />
      <p className="text-caption">
        <Trans>
          CS2 doesn't have a built-in highlights/lowlights algorithm yet. The custom algorithm is always used for CS2
          demos.
        </Trans>
      </p>
    </div>
  );
}
