import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import React, { cloneElement, useState } from 'react';
import type { Middleware, Strategy } from '@floating-ui/react';
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
  useClientPoint,
} from '@floating-ui/react';

type Placement = 'top' | 'right' | 'bottom' | 'left';

type WrapperProps = {
  placement: Placement;
  x: number;
  y: number;
  strategy: Strategy;
  children: ReactNode;
  refs: ReturnType<typeof useFloating>['refs'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
};

function Wrapper({ x, y, refs, children, strategy, placement, getFloatingProps }: WrapperProps) {
  const arrowClasses: Record<Placement, string> = {
    right: 'tooltip-right',
    left: 'tooltip-left',
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
  };
  const arrowClassName = arrowClasses[placement] ?? '';

  return (
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
      {children}
    </div>
  );
}

type Props = {
  children: React.ReactElement<Record<string, unknown>>;
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

  const node = (
    <Wrapper
      refs={refs}
      strategy={strategy}
      x={x}
      y={y}
      placement={finalPlacement as Placement}
      getFloatingProps={getFloatingProps}
    >
      {content}
    </Wrapper>
  );

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      {isVisible ? (renderInPortal ? ReactDOM.createPortal(node, document.body) : node) : null}
    </>
  );
}

type Options = {
  isVisible: boolean;
  children: React.ReactNode;
  placement?: Placement;
};

export function useTooltip({ children, placement = 'top', isVisible }: Options) {
  const { x, y, strategy, context, refs } = useFloating({
    placement,
    open: isVisible,
    middleware: [offset(16), shift()],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([useClientPoint(context)]);

  const node = (
    <Wrapper refs={refs} strategy={strategy} x={x} y={y} placement={placement} getFloatingProps={getFloatingProps}>
      {children}
    </Wrapper>
  );

  return { refs, getReferenceProps, node };
}
