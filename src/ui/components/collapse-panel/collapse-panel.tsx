import React, { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  header: ReactNode;
  children: ReactNode;
};

export function CollapsePanel({ header, children }: Props) {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isContentVisible && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isContentVisible, children]);

  return (
    <div>
      <div
        className="flex cursor-pointer items-center rounded border border-gray-300 bg-gray-75 p-12"
        onClick={() => setIsContentVisible((prevIsVisible) => !prevIsVisible)}
      >
        {header}
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-200 ease-linear"
        style={{
          height: `${height}px`,
        }}
      >
        <div className="flex flex-col overflow-auto border-x border-b border-gray-300 bg-gray-75 p-12">{children}</div>
      </div>
    </div>
  );
}
