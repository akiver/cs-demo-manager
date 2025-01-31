import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useShowToast } from '../components/toasts/use-show-toast';
import { useWebSocketClient } from './use-web-socket-client';
import type { SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import type { ExportChatMessagesPayload } from 'csdm/server/handlers/renderer-process/match/export-match-chat-messages-handler';
import type { ChatMessage } from 'csdm/common/types/chat-message';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';

export function useExportMatchChatMessages() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const { t } = useLingui();

  return async (checksum: string, messages?: ChatMessage[]) => {
    const options: SaveDialogOptions = {
      defaultPath: `messages-${checksum}.txt`,
      title: t({
        context: 'OS save dialog title',
        message: 'Export',
      }),
      filters: [{ name: 'TXT', extensions: ['txt'] }],
    };
    const { canceled, filePath }: SaveDialogReturnValue = await window.csdm.showSaveDialog(options);
    if (canceled || filePath === undefined) {
      return;
    }

    try {
      const payload: ExportChatMessagesPayload = {
        checksum,
        filePath,
        messages,
      };
      const hasMessages = await client.send({
        name: RendererClientMessageName.ExportMatchChatMessages,
        payload,
      });

      if (hasMessages) {
        showToast({
          content: <Trans>Chat messages exported, click here to reveal the file</Trans>,
          type: 'success',
          onClick: () => {
            window.csdm.browseToFile(filePath);
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
}
