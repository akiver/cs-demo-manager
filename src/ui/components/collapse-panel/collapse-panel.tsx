import React, { useRef, useState, type ReactNode } from 'react';

type Props = {
  header: ReactNode;
  children: ReactNode;
};

export function CollapsePanel({ header, children }: Props) {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const height = isContentVisible ? (ref.current?.getBoundingClientRect().height ?? 0) : 0;

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  return (
    <div>
      <div
        className="flex cursor-pointer items-center rounded border border-gray-300 bg-gray-75 p-12"
        onClick={toggleContentVisibility}
      >
        {header}
      </div>
      <div
        className="overflow-hidden transition-[height] duration-200 ease-linear"
        style={{
          height: `${height}px`,
        }}
      >
        <div className="flex flex-col overflow-auto border-x border-b border-gray-300 bg-gray-75 p-12" ref={ref}>
          {children}
        </div>
      </div>
    </div>
  );
}
