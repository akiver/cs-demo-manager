import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import type { ChatMessage } from 'csdm/common/types/chat-message';
import { useExportMatchChatMessages } from 'csdm/ui/hooks/use-export-match-chat-messages';

type Props = {
  checksum: string;
  messages: ChatMessage[];
};

export function ExportChatMessagesButton({ checksum, messages }: Props) {
  const exportMessages = useExportMatchChatMessages();

  const onClick = () => {
    exportMessages(checksum, messages);
  };

  return (
    <Button onClick={onClick} isDisabled={messages.length === 0}>
      <Trans context="Button">Export</Trans>
    </Button>
  );
}
