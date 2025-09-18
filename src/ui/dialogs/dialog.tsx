import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useBlockNavigation } from 'csdm/ui/hooks/use-block-navigation';
import { useDialog } from '../components/dialogs/use-dialog';

type BaseProps = {
  closeOnBackgroundClicked?: boolean;
  closeOnEscPressed?: boolean;
  onClose?: () => void;
  onEnterPressed?: (event: React.KeyboardEvent) => void;
  children: ReactNode;
  blockNavigation?: boolean;
};

export function Dialog({
  onClose,
  closeOnBackgroundClicked = true,
  closeOnEscPressed = true,
  children,
  onEnterPressed,
  blockNavigation = true,
}: BaseProps) {
  const container = useRef<HTMLDivElement>(null);
  useBlockNavigation(blockNavigation);
  const { hideDialog } = useDialog();

  const handleClose = () => {
    onClose?.();
    hideDialog();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation();

    switch (event.key) {
      case 'Escape':
        if (closeOnEscPressed) {
          handleClose();
        }
        break;
      case 'Enter':
        if (typeof onEnterPressed === 'function') {
          onEnterPressed(event);
        }
        break;
    }
  };

  const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const onBackgroundLayerClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const isMouseLeftClick = event.button === 0;
    if (isMouseLeftClick && closeOnBackgroundClicked) {
      handleClose();
    }
  };

  useEffect(() => {
    container.current?.focus();
  }, [container]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/75 pt-[var(--title-bar-height)]"
      onMouseDown={onBackgroundLayerClick}
    >
      <div
        ref={container}
        className="flex max-h-[calc(100vh-140px)] min-w-[524px] flex-col overflow-y-auto rounded bg-gray-50 text-gray-800 shadow-[0_0_0_1px_var(--color-gray-300)] focus-visible:outline-hidden"
        tabIndex={-1}
        onMouseDown={onMouseDown}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

type ContentProps = {
  children: ReactNode;
};

export function DialogContent({ children }: ContentProps) {
  return <div className="flex flex-col px-24 pt-12 pb-24">{children}</div>;
}

type HeaderProps = {
  children: ReactNode;
};

export function DialogHeader({ children }: HeaderProps) {
  return <header className="px-24 pt-24">{children}</header>;
}

type FooterProps = {
  children: ReactNode;
};

export function DialogFooter({ children }: FooterProps) {
  return (
    <footer className="flex flex-1 items-center justify-end gap-x-8 border-t border-gray-200 p-24">{children}</footer>
  );
}

type TitleProps = {
  children: ReactNode;
};

export function DialogTitle({ children }: TitleProps) {
  return <h1 className="text-subtitle">{children}</h1>;
}
