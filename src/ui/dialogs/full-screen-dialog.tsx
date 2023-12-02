import React, { useEffect } from 'react';
import type { SpringValue } from '@react-spring/web';
import { useTransition, animated } from '@react-spring/web';
import { useBlockNavigation } from '../hooks/use-block-navigation';
import { useFocusTrap } from '../hooks/use-focus-trap';

type Props = {
  isVisible: boolean;
  children: React.ReactNode;
};

type DialogProps = {
  children: React.ReactNode;
  style: {
    opacity: SpringValue<number>;
  };
};

function Dialog({ children, style }: DialogProps) {
  const container = useFocusTrap();

  useEffect(() => {
    container.current?.focus();
  }, [container]);

  return (
    <animated.div
      ref={container}
      className="absolute inset-0 w-full h-full bg-overlay z-1 pt-[var(--title-bar-height)] focus-visible:outline-none"
      style={style}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </animated.div>
  );
}

export function FullScreenDialog({ isVisible, children }: Props) {
  const transitions = useTransition(isVisible, {
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
  useBlockNavigation(isVisible);

  return transitions((style, isVisible) => {
    return isVisible ? <Dialog style={style}>{children}</Dialog> : null;
  });
}
