import type { ReactNode } from 'react';
import React, { createContext, useEffect, useRef, useState } from 'react';

type FullscreenState = {
  toggleFullscreen: () => void;
  isFullscreenEnabled: boolean;
};

export const FullscreenContext = createContext<FullscreenState>({
  toggleFullscreen: () => {
    throw new Error('toggleFullscreen not implemented');
  },
  isFullscreenEnabled: false,
});

type Props = {
  children: ReactNode;
};

export function FullscreenProvider({ children }: Props) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreenEnabled(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  return (
    <div className="flex flex-col flex-1" ref={wrapper}>
      <FullscreenContext.Provider
        value={{
          toggleFullscreen: async () => {
            if (isFullscreenEnabled) {
              await document.exitFullscreen();
            } else {
              await wrapper.current?.requestFullscreen();
            }
          },
          isFullscreenEnabled,
        }}
      >
        {children}
      </FullscreenContext.Provider>
    </div>
  );
}
