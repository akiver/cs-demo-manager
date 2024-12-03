import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { Button } from 'csdm/ui/components/buttons/button';

export function ClearLogsButton() {
  const showToast = useShowToast();

  const onClick = async () => {
    try {
      await logger.clear();
      showToast({
        content: <Trans>Log file cleared</Trans>,
        id: 'clear-log-file',
        type: 'success',
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'clear-log-file',
        type: 'error',
      });
    }
  };

  return (
    <Button onClick={onClick}>
      <Trans>Clear log file</Trans>
    </Button>
  );
}
