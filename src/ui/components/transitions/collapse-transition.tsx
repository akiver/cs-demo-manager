import React, { useState, useRef, useEffect, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  isVisible: boolean;
};

export function CollapseTransition({ children, isVisible }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (isVisible && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    } else {
      setMaxHeight(0);
    }
  }, [isVisible]);

  return (
    <div
      ref={contentRef}
      className={`transition-[max-height,opacity] duration-200 ease-out overflow-hidden max-h-0 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
