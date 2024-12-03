import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useAnalyses } from 'csdm/ui/analyses/use-analyses';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';

export function RemoveAllAnalysesButton() {
  const analyses = useAnalyses();
  const client = useWebSocketClient();
  const isDisabled = analyses.length === 0;

  const onClick = () => {
    const checksums = analyses.map((analysis) => analysis.demoChecksum);
    client.send({
      name: RendererClientMessageName.RemoveDemosFromAnalyses,
      payload: checksums,
    });
  };

  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans>Remove all</Trans>
    </Button>
  );
}
