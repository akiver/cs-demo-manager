import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';

export function RevealLogFileButton() {
  const onBrowseClick = () => {
    window.csdm.browseToFile(logger.getLogFilePath());
  };

  return (
    <Button onClick={onBrowseClick}>
      <Trans>Reveal log file</Trans>
    </Button>
  );
}
