import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { ChatMessage } from 'csdm/common/types/chat-message';
import { TeamText } from 'csdm/ui/components/team-text';

type Props = {
  chatMessage: ChatMessage;
};

export function ChatMessageRow({ chatMessage }: Props) {
  const { senderName, senderSide, senderIsAlive, message } = chatMessage;
  const playerStatus = senderIsAlive ? '' : <Trans context="Chat message status">*DEAD*</Trans>;

  return (
    <div>
      <TeamText teamNumber={senderSide} className="select-text">
        {playerStatus} {senderName}
      </TeamText>
      <span className="select-text">: </span>
      <span className="select-text">{message}</span>
    </div>
  );
}
