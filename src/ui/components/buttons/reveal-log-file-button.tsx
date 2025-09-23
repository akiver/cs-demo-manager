import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useShowToast } from '../toasts/use-show-toast';

export function RevealLogFileButton() {
  const showToast = useShowToast();

  const onBrowseClick = async () => {
    const logFilePath = logger.getLogFilePath();
    if (!(await window.csdm.pathExists(logFilePath))) {
      return showToast({
        type: 'error',
        content: <Trans>The log file does not exist</Trans>,
      });
    }

    window.csdm.browseToFile(logFilePath);
  };

  return (
    <Button onClick={onBrowseClick}>
      <Trans>Reveal log file</Trans>
    </Button>
  );
}
