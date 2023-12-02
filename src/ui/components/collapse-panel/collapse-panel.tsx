import React, { useRef, useState, useEffect, type ReactNode } from 'react';

type Props = {
  header: ReactNode;
  children: ReactNode;
};

export function CollapsePanel({ header, children }: Props) {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    setContentHeight(ref.current.getBoundingClientRect().height);
  }, []);

  const height = isContentVisible ? contentHeight : 0;

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  return (
    <div>
      <div
        className="flex items-center p-12 bg-gray-75 border border-gray-300 rounded cursor-pointer"
        onClick={toggleContentVisibility}
      >
        {header}
      </div>
      <div
        className="overflow-hidden transition-[height] ease-linear duration-200"
        style={{
          height: `${height}px`,
        }}
      >
        <div className="flex flex-col p-12 bg-gray-75 border-gray-300 border-b border-x overflow-auto" ref={ref}>
          {children}
        </div>
      </div>
    </div>
  );
}
