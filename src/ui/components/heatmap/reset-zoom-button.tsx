import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { ResetHeatmapZoom } from './heatmap-events';

export function ResetZoomButton() {
  const onClick = () => {
    window.dispatchEvent(new ResetHeatmapZoom());
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">Reset zoom</Trans>
    </Button>
  );
}
