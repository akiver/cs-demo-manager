import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
};

function Dialog({ children }: DialogProps) {
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
    <motion.div
      ref={container}
      className="absolute inset-0 size-full bg-overlay z-1 pt-[var(--title-bar-height)] focus-visible:outline-hidden"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </motion.div>
  );
}

export function FullScreenDialog({ isVisible, children }: Props) {
  useBlockNavigation(isVisible);

  return isVisible ? <Dialog>{children}</Dialog> : null;
}
