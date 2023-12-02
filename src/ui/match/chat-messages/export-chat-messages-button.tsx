import React from 'react';
import { Trans, msg } from '@lingui/macro';
import type { SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import { Button } from 'csdm/ui/components/buttons/button';
import type { ChatMessage } from 'csdm/common/types/chat-message';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { ExportChatMessagesPayload } from 'csdm/server/handlers/renderer-process/match/export-match-chat-messages-handler';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

function formatChatMessage(chatMessage: ChatMessage) {
  const { senderIsAlive, senderName, message } = chatMessage;
  const playerStatus = senderIsAlive ? '' : '*DEAD* ';

  return `${playerStatus}${senderName} : ${message}`;
}

type Props = {
  checksum: string;
  chatMessages: ChatMessage[];
};

export function ExportChatMessagesButton({ checksum, chatMessages }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const _ = useI18n();

  const onClick = async () => {
    const options: SaveDialogOptions = {
      defaultPath: `messages-${checksum}.txt`,
      title: _(
        msg({
          context: 'OS save dialog title',
          message: 'Export',
        }),
      ),
      filters: [{ name: 'TXT', extensions: ['txt'] }],
    };
    const { canceled, filePath }: SaveDialogReturnValue = await window.csdm.showSaveDialog(options);
    if (canceled || filePath === undefined) {
      return;
    }

    try {
      const messages = chatMessages.map(formatChatMessage);
      const payload: ExportChatMessagesPayload = {
        filePath,
        messages,
      };
      await client.send({
        name: RendererClientMessageName.ExportMatchChatMessages,
        payload,
      });

      showToast({
        content: <Trans>Chat messages exported</Trans>,
        id: 'chat-messages-export',
        type: 'success',
        onClick: () => {
          window.csdm.browseToFile(filePath);
        },
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'chat-messages-export',
        type: 'error',
      });
    }
  };

  return (
    <Button onClick={onClick} isDisabled={chatMessages.length === 0}>
      <Trans context="Button">Export</Trans>
    </Button>
  );
}
