import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import React, { cloneElement, useState } from 'react';
import type { Middleware } from '@floating-ui/react';
import {
  offset,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useRole,
  autoPlacement,
  useMergeRefs,
} from '@floating-ui/react';

type Placement = 'top' | 'right' | 'bottom' | 'left';

type Props = {
  children: React.ReactElement;
  content: ReactNode;
  placement?: Placement;
  delay?: number;
  renderInPortal?: boolean;
};

export function Tooltip({
  children,
  content,
  delay = 500, // 500ms is the default on Windows/Linux. It's 2000ms on macOS but it's too long and annoying.
  placement,
  renderInPortal,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const middleware: Middleware[] = [offset(6), shift()];
  if (placement === undefined) {
    middleware.push(
      autoPlacement({
        allowedPlacements: ['bottom', 'left', 'right', 'top'],
        alignment: 'start',
      }),
    );
  }

  const {
    x,
    y,
    strategy,
    context,
    refs,
    placement: finalPlacement,
  } = useFloating({
    placement,
    open: isVisible,
    onOpenChange: setIsVisible,
    middleware: middleware,
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      delay: {
        open: delay,
        close: 0,
      },
    }),
    useFocus(context),
    useRole(context, { role: 'tooltip' }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useMergeRefs([refs.setReference, (children as any).ref]);

  const arrowClasses: Record<Placement, string> = {
    right: 'tooltip-right',
    left: 'tooltip-left',
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
  };
  const arrowClassName = arrowClasses[finalPlacement as Placement] ?? '';

  const node = (
    <div
      ref={refs.setFloating}
      className={`bg-gray-75 border border-gray-400 p-8 rounded select-none transition-opacity duration-300 z-10 ${arrowClassName}`}
      style={{
        position: strategy,
        top: y,
        left: x,
      }}
      {...getFloatingProps()}
    >
      {content}
    </div>
  );

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      {isVisible ? (renderInPortal ? ReactDOM.createPortal(node, document.body) : node) : null}
    </>
  );
}
