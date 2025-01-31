import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useShowToast } from '../../toasts/use-show-toast';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { ExportMatchesChatMessagesPayload } from 'csdm/server/handlers/renderer-process/match/export-matches-chat-messages-handler';
import { useExportMatchChatMessages } from 'csdm/ui/hooks/use-export-match-chat-messages';

type Props = {
  checksums: string[];
};

export function ExportChatMessagesItem({ checksums }: Props) {
  const { t } = useLingui();
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const exportChatMessages = useExportMatchChatMessages();

  const onClick = async () => {
    if (checksums.length === 1) {
      return exportChatMessages(checksums[0]);
    }

    const { filePaths, canceled } = await window.csdm.showOpenDialog({
      buttonLabel: t({
        context: 'Button label',
        message: 'Select',
      }),
      properties: ['openDirectory'],
    });

    if (canceled || filePaths.length === 0) {
      return;
    }

    const outputFolderPath = filePaths[0];

    try {
      const payload: ExportMatchesChatMessagesPayload = {
        checksums,
        outputFolderPath,
      };
      const hasExportedAtLeastOneMatch = await client.send({
        name: RendererClientMessageName.ExportMatchesChatMessages,
        payload,
      });

      if (hasExportedAtLeastOneMatch) {
        showToast({
          content: <Trans context="Toast">Chat messages exported, click here to reveal the folder</Trans>,
          type: 'success',
          onClick: () => {
            window.csdm.browseToFolder(outputFolderPath);
          },
        });
      } else {
        showToast({
          content: <Trans>No chat messages to export</Trans>,
          type: 'warning',
        });
      }
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        type: 'error',
      });
    }
  };

  return (
    <ContextMenuItem onClick={onClick} isDisabled={checksums.length === 0}>
      <Trans context="Context menu">Chat messages</Trans>
    </ContextMenuItem>
  );
}
