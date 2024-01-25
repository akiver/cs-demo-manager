import React, { useEffect, useRef } from 'react';
import type { SpringValue } from '@react-spring/web';
import { useTransition, animated } from '@react-spring/web';
import { useBlockNavigation } from 'csdm/ui/hooks/use-block-navigation';
import { makeElementInert, makeElementNonInert } from 'csdm/ui/shared/inert';
import { useFocusLastActiveElement } from 'csdm/ui/hooks/use-focus-last-active-element';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';

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
  const container = useRef<HTMLDivElement>(null);
  const { updateElement, focusElement } = useFocusLastActiveElement();

  useEffect(() => {
    updateElement();
    makeElementInert(APP_ELEMENT_ID);

    return () => {
      makeElementNonInert(APP_ELEMENT_ID);
      focusElement();
    };
  }, [updateElement, focusElement]);

  useEffect(() => {
    container.current?.focus();
  }, [container]);

  return (
    <animated.div
      ref={container}
      className="absolute inset-0 size-full bg-overlay z-1 pt-[var(--title-bar-height)] focus-visible:outline-none"
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
