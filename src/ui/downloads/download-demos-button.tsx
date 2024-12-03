import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { Status } from 'csdm/common/types/status';
import { ErrorCode } from 'csdm/common/error-code';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { Download } from 'csdm/common/download/download-types';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

type Props = {
  downloads: Download[];
  loadingStatus: Status;
};

export function DownloadDemosButton({ downloads, loadingStatus }: Props) {
  const client = useWebSocketClient();
  const isDisabled = downloads.length === 0 || loadingStatus !== Status.Success;
  const showToast = useShowToast();

  const onClick = async () => {
    try {
      await client.send({
        name: RendererClientMessageName.AddDownloads,
        payload: downloads,
      });
    } catch (error) {
      let errorMessage: ReactNode;
      switch (error) {
        case ErrorCode.DownloadFolderNotDefined:
          errorMessage = <Trans>A download folder is required. You can change it from settings.</Trans>;
          break;
        case ErrorCode.DownloadFolderNotExists:
          errorMessage = <Trans>The download folder doesn't exist, please change it from the settings.</Trans>;
          break;
        default:
          errorMessage = <Trans>An error occurred.</Trans>;
      }

      showToast({
        id: 'download-demos-error',
        content: errorMessage,
        type: 'error',
      });
    }
  };

  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Download all</Trans>
    </Button>
  );
}
