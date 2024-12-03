import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useAnalyses } from 'csdm/ui/analyses/use-analyses';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';

export function RemoveAnalysesSucceedButton() {
  const analyses = useAnalyses();
  const client = useWebSocketClient();
  const analysesSucceed = analyses.filter((analysis) => analysis.status === AnalysisStatus.InsertSuccess);
  const isDisabled = analysesSucceed.length === 0;

  const onClick = () => {
    const checksums = analysesSucceed.map((analysis) => analysis.demoChecksum);
    client.send({
      name: RendererClientMessageName.RemoveDemosFromAnalyses,
      payload: checksums,
    });
  };

  return (
    <Button isDisabled={isDisabled} onClick={onClick}>
      <Trans>Remove succeed analyses</Trans>
    </Button>
  );
}
