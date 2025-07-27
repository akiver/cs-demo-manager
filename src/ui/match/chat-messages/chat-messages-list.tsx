import React, { useRef, useEffect } from 'react';
import { Content } from 'csdm/ui/components/content';
import { isSelectAllKeyboardEvent } from 'csdm/ui/keyboard/keyboard';
import type { ChatMessage } from 'csdm/common/types/chat-message';
import { ChatMessageRow } from './chat-message';

type Props = {
  chatMessages: ChatMessage[];
};

export function ChatMessagesList({ chatMessages }: Props) {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }

      if (isSelectAllKeyboardEvent(event)) {
        event.preventDefault();
        if (chatRef.current !== null) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(chatRef.current);
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Content>
      <div className="select-text" ref={chatRef}>
        {chatMessages.map((chat) => {
          return <ChatMessageRow key={chat.id} chatMessage={chat} />;
        })}
      </div>
    </Content>
  );
}
