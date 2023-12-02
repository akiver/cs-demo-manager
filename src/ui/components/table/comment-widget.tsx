import React, { useEffect, useRef } from 'react';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { TextArea } from 'csdm/ui/components/inputs/text-area';

type Props = {
  key: string; // The key is important to re-render the component when the selected row changed.
  comment: string | undefined;
  onDestroy: (comment: string) => void;
  onClose: () => void;
};

export function TableCommentWidget({ onClose, comment, onDestroy }: Props) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const currentActiveElement = useRef(document.activeElement);

  useEffect(() => {
    const input = inputRef.current;
    const activeElement = currentActiveElement.current;

    return () => {
      if (input === null) {
        return;
      }

      if (activeElement instanceof HTMLElement) {
        activeElement.focus();
      }

      onDestroy(input.value);
    };
  }, [onDestroy]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (inputRef.current !== document.activeElement) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="absolute right-16 top-[84px] z-1 bg-gray-75 border border-gray-300 p-16 flex flex-col gap-y-8 rounded-8 shadow-[0_0_4px_0_theme(colors.gray.500)]">
      <div className="w-[500px] h-[300px]">
        <TextArea ref={inputRef} defaultValue={comment} resizable={false} />
      </div>
      <div>
        <CloseButton onClick={onClose} />
      </div>
    </div>
  );
}
