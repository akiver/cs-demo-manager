import ReactDOM from 'react-dom';
import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { makeElementInert, makeElementNonInert } from 'csdm/ui/shared/inert';
import { useFocusLastActiveElement } from 'csdm/ui/hooks/use-focus-last-active-element';

type DialogContextState = {
  showDialog: (dialog: ReactNode) => void;
  hideDialog: () => void;
};

export const DialogContext = createContext<DialogContextState>({
  showDialog: () => {
    throw new Error('showDialog not implemented');
  },
  hideDialog: () => {
    throw new Error('hideDialog not implemented');
  },
});

type Props = {
  children: ReactNode;
  inertElementId: string;
};

export function DialogProvider({ children, inertElementId }: Props) {
  const [dialog, setDialog] = useState<ReactNode | undefined>(undefined);
  const { focusElement, updateElement } = useFocusLastActiveElement();
  const transitions = useTransition(dialog, {
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
    exitBeforeEnter: true,
  });

  return (
    <DialogContext.Provider
      value={{
        showDialog: (dialog) => {
          setDialog(dialog);
          updateElement();
          makeElementInert(inertElementId);
        },
        hideDialog: () => {
          setDialog(undefined);
          makeElementNonInert(inertElementId);
          focusElement();
        },
      }}
    >
      {children}
      {transitions((style, dialog) => {
        return dialog
          ? ReactDOM.createPortal(
              <animated.div className="absolute inset-0 z-[3] focus-within:outline-none" style={style}>
                {dialog}
              </animated.div>,
              document.body,
            )
          : null;
      })}
    </DialogContext.Provider>
  );
}
