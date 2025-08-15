import React, {
  createContext,
  useContext,
  useState,
  type HTMLProps,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { Placement } from '@floating-ui/react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  useHover,
  safePolygon,
} from '@floating-ui/react';

type PopoverOptions = {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  openOnHover?: boolean;
};

function usePopover({
  initialOpen = false,
  openOnHover = false,
  placement = 'top',
  modal,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PopoverOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'end',
        padding: 8,
      }),
      shift({ padding: 4 }),
    ],
  });
  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen === null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const hover = useHover(context, {
    handleClose: safePolygon(),
    enabled: openOnHover,
  });
  const interactions = useInteractions([click, dismiss, role, hover]);

  return {
    open,
    setOpen,
    ...interactions,
    ...data,
    modal,
    labelId,
    descriptionId,
    setLabelId,
    setDescriptionId,
  };
}

type ContextType =
  | (ReturnType<typeof usePopover> & {
      setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
      setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
    })
  | null;

const PopoverContext = createContext<ContextType>(null);

function usePopoverContext() {
  const context = useContext(PopoverContext);

  if (context === null) {
    throw new Error('Popover components must be wrapped in <Popover />');
  }

  return context;
}

export function Popover({
  children,
  modal = true,
  ...options
}: {
  children: ReactNode;
} & PopoverOptions) {
  const popover = usePopover({ modal, ...options });

  return <PopoverContext value={popover}>{children}</PopoverContext>;
}

type PopoverTriggerProps = HTMLProps<HTMLElement> & {
  children: ReactElement<HTMLProps<HTMLElement>>;
  asChild?: boolean;
};

export function PopoverTrigger({
  children,
  ref: propRef,
  asChild = false,
  ...props
}: PopoverTriggerProps & { ref?: Ref<HTMLElement> }) {
  const context = usePopoverContext();
  const childrenRef = children.props.ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
      }),
    );
  }

  return (
    <button ref={ref} type="button" {...context.getReferenceProps(props)}>
      {children}
    </button>
  );
}

export function PopoverContent({
  ref: propRef,
  style,
  ...props
}: HTMLProps<HTMLDivElement> & { ref?: Ref<HTMLDivElement> } = {}) {
  const { context: floatingContext, ...context } = usePopoverContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) {
    return null;
  }

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={context.modal}>
        <div
          ref={ref}
          style={{ ...context.floatingStyles, ...style }}
          aria-labelledby={context.labelId}
          aria-describedby={context.descriptionId}
          {...context.getFloatingProps(props)}
        >
          {props.children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
