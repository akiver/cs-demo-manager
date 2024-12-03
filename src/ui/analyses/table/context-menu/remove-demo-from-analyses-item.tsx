import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useSelectedAnalysis } from 'csdm/ui/analyses/use-selected-analysis-demo-id';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

export function RemoveDemoFromAnalysesItem() {
  const selectedAnalysis = useSelectedAnalysis();
  const client = useWebSocketClient();

  const onClick = () => {
    if (selectedAnalysis === undefined) {
      return;
    }

    client.send({
      name: RendererClientMessageName.RemoveDemosFromAnalyses,
      payload: [selectedAnalysis.demoChecksum],
    });
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Remove</Trans>
    </ContextMenuItem>
  );
}
