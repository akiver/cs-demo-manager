import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { ErrorCode } from 'csdm/common/error-code';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { Download } from 'csdm/common/download/download-types';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { Tooltip } from 'csdm/ui/components/tooltip';

type Props = {
  download: Download;
  status: DownloadStatus;
};

export function DownloadDemoButton({ download, status }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();

  const onClick = async () => {
    try {
      await client.send({
        name: RendererClientMessageName.AddDownload,
        payload: download,
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
        case ErrorCode.MatchAlreadyInDownloadQueue:
          errorMessage = <Trans>This match is already in pending downloads.</Trans>;
          break;
        case ErrorCode.MatchAlreadyDownloaded:
          errorMessage = <Trans>This match is already in your downloads folder.</Trans>;
          break;
        case ErrorCode.DemoLinkExpired:
          errorMessage = <Trans>The download link has expired.</Trans>;
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

  let isDisabled = true;
  let tooltip: ReactNode | undefined;

  switch (status) {
    case DownloadStatus.Expired:
      tooltip = <Trans context="Tooltip">Download link expired</Trans>;
      break;
    case DownloadStatus.Corrupted:
      tooltip = <Trans context="Tooltip">The demo is corrupted</Trans>;
      isDisabled = false;
      break;
    case DownloadStatus.Downloading:
      tooltip = <Trans context="Tooltip">Download in progress</Trans>;
      break;
    case DownloadStatus.Downloaded:
      tooltip = <Trans context="Tooltip">Demo already downloaded</Trans>;
      break;
    case DownloadStatus.Error:
    case DownloadStatus.NotDownloaded:
      isDisabled = false;
      break;
  }

  let button = (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Download</Trans>
    </Button>
  );

  if (tooltip !== undefined) {
    button = (
      <Tooltip content={tooltip} placement="top">
        {button}
      </Tooltip>
    );
  }

  return button;
}
