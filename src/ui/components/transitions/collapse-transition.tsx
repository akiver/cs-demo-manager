import React, { useRef, type ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  isVisible: boolean;
};

export function CollapseTransition({ children, isVisible }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const maxHeight = isVisible ? contentRef.current?.scrollHeight : 0;

  return (
    <div
      ref={contentRef}
      className={clsx(
        'max-h-0 overflow-hidden transition-[max-height,opacity] duration-200 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
