import React, { useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useBlockNavigation } from 'csdm/ui/hooks/use-block-navigation';
import { useDialog } from '../components/dialogs/use-dialog';
import { useFocusTrap } from '../hooks/use-focus-trap';

type BaseProps = {
  closeOnBackgroundClicked?: boolean;
  closeOnEscPressed?: boolean;
  onClose?: () => void;
  onEnterPressed?: () => void;
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
  const container = useFocusTrap();
  useBlockNavigation(blockNavigation);
  const { hideDialog } = useDialog();

  const handleClose = useCallback(() => {
    onClose?.();
    hideDialog();
  }, [onClose, hideDialog]);

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
          event.preventDefault();
          onEnterPressed();
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
      className="absolute inset-0 flex justify-center items-center bg-black/75 pt-[var(--title-bar-height)]"
      onMouseDown={onBackgroundLayerClick}
    >
      <div
        ref={container}
        className="flex flex-col bg-gray-50 text-gray-800 rounded min-w-[524px] max-h-full focus-visible:outline-none shadow-[0_0_0_1px_theme(colors.gray.300)]"
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
  return <div className="flex flex-col px-24 pb-24 pt-12">{children}</div>;
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
  return <footer className="flex items-center justify-end flex-1 gap-x-8 p-24 border-t">{children}</footer>;
}

type TitleProps = {
  children: ReactNode;
};

export function DialogTitle({ children }: TitleProps) {
  return <h1 className="text-subtitle">{children}</h1>;
}
