import ReactDOM from 'react-dom';
import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
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
      {dialog
        ? ReactDOM.createPortal(
            <motion.div
              className="absolute inset-0 z-[3] focus-within:outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
            >
              {dialog}
            </motion.div>,
            document.body,
          )
        : null}
    </DialogContext.Provider>
  );
}
