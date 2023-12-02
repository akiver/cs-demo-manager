import React, { createContext, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTransition, animated } from '@react-spring/web';

type ContextMenuContextState = {
  showContextMenu: (event: MouseEvent, contextMenu: ReactNode) => void;
  hideContextMenu: () => void;
};

export const ContextMenuContext = createContext<ContextMenuContextState>({
  showContextMenu: () => {
    throw new Error('showContextMenu not implemented');
  },
  hideContextMenu: () => {
    throw new Error('hideContextMenu not implemented');
  },
});

type Position = {
  x: number;
  y: number;
};

type Props = {
  children: ReactNode;
};

export function ContextMenuProvider({ children }: Props) {
  const positionRef = useRef<Position>({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<ReactNode | undefined>(undefined);
  const transitions = useTransition(contextMenu, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
    leave: {
      opacity: 0,
    },
    config: {
      duration: 200,
    },
  });

  const hideContextMenu = useCallback(() => {
    setContextMenu(undefined);
  }, []);

  const showContextMenu = useCallback((event: MouseEvent, contextMenu: ReactNode) => {
    event.preventDefault();
    positionRef.current = { x: event.clientX, y: event.clientY };
    setContextMenu(contextMenu);
  }, []);

  const onWrapperMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (contextMenu === undefined || wrapper === null) {
      return;
    }

    const onWindowClick = (event: MouseEvent) => {
      if (event.target instanceof Node && wrapper.contains(event.target)) {
        event.preventDefault();
      } else {
        hideContextMenu();
      }
    };

    window.addEventListener('click', onWindowClick);

    return () => {
      window.removeEventListener('click', onWindowClick);
    };
  }, [contextMenu, hideContextMenu]);

  useEffect(() => {
    if (contextMenu === undefined) {
      return;
    }

    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideContextMenu();
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [contextMenu, hideContextMenu]);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contextMenu === undefined) {
      return;
    }

    const { offsetWidth: menuWidth, offsetHeight: menuHeight } = wrapperRef.current;
    let x = positionRef.current.x;
    let y = positionRef.current.y;

    if (x + menuWidth > window.innerWidth) {
      x -= x + menuWidth - window.innerWidth;
    }

    if (y + menuHeight > window.innerHeight) {
      y -= y + menuHeight - window.innerHeight;
    }

    wrapperRef.current.setAttribute('style', `left: ${x}px; top:${y}px;`);
  }, [contextMenu]);

  return (
    <ContextMenuContext.Provider
      value={{
        hideContextMenu,
        showContextMenu,
      }}
    >
      {children}
      {transitions((style, contextMenu) => {
        return contextMenu ? (
          <animated.div className="absolute z-1" ref={wrapperRef} onMouseDown={onWrapperMouseDown} style={style}>
            {contextMenu}
          </animated.div>
        ) : null;
      })}
    </ContextMenuContext.Provider>
  );
}
