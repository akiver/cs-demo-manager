import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

export function ResetTablesState() {
  const client = useWebSocketClient();

  const showToast = useShowToast();

  const onClick = async () => {
    try {
      await client.send({
        name: RendererClientMessageName.ResetTablesState,
      });
    } catch (error) {
      showToast({
        id: 'reset-tables-state-error',
        content: <Trans>An error occurred</Trans>,
        type: 'error',
      });
    }
  };

  return (
    <div className="mt-12 gap-y-8">
      <Button onClick={onClick}>
        <Trans context="Button" comment="Reset tables (columns order, visibility…)">
          Reset tables
        </Trans>
      </Button>
    </div>
  );
}
