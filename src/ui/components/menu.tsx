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
} from '@floating-ui/react';
import clsx from 'clsx';

type MenuOptions = {
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function useMenu({ placement = 'bottom', open: controlledOpen, onOpenChange: setControlledOpen }: MenuOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
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
  const interactions = useInteractions([click, dismiss, role]);

  return {
    open,
    setOpen,
    ...interactions,
    ...data,
    labelId,
    descriptionId,
    setLabelId,
    setDescriptionId,
  };
}

type ContextType =
  | (ReturnType<typeof useMenu> & {
      setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
      setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
    })
  | null;

const MenuContext = createContext<ContextType>(null);

function useMenuContext() {
  const context = useContext(MenuContext);

  if (context === null) {
    throw new Error('Menu components must be wrapped in <Menu />');
  }

  return context;
}

export function Menu({
  children,
  ...options
}: {
  children: ReactNode;
} & MenuOptions) {
  const menu = useMenu(options);

  return <MenuContext value={menu}>{children}</MenuContext>;
}

type MenuTriggerProps = HTMLProps<HTMLElement> & {
  children: ReactElement<HTMLProps<HTMLElement>>;
  ref?: Ref<HTMLElement>;
};

export function MenuTrigger({ children, ref: propRef, ...props }: MenuTriggerProps) {
  const context = useMenuContext();
  const childrenRef = children.props.ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  return (
    <button ref={ref} type="button" {...context.getReferenceProps(props)}>
      {children}
    </button>
  );
}

export function MenuContent({
  ref: propRef,
  style,
  ...props
}: HTMLProps<HTMLDivElement> & { ref?: Ref<HTMLDivElement> } = {}) {
  const { context: floatingContext, ...context } = useMenuContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) {
    return null;
  }

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext}>
        <div
          ref={ref}
          style={{ ...context.floatingStyles, ...style }}
          aria-labelledby={context.labelId}
          aria-describedby={context.descriptionId}
          {...context.getFloatingProps(props)}
        >
          <div className="rounded-8 bg-gray-100 p-4 shadow-[0_0_4px_0_var(--color-gray-500)]">{props.children}</div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

type MenuItemProps = {
  children: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
};

export function MenuItem({ onClick, children, isDisabled }: MenuItemProps) {
  const contextMenu = useMenuContext();

  const handleClick = () => {
    onClick();
    contextMenu.setOpen(false);
  };

  return (
    <button
      className={clsx(
        'flex h-32 items-center rounded px-16 leading-none select-none hover:bg-gray-200',
        isDisabled ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100 hover:text-gray-900',
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export { type Placement };
