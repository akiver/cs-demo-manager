import React, { useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LeftArrowIcon } from 'csdm/ui/icons/left-arrow-icon';
import { RightArrowIcon } from '../icons/right-arrow-icon';
import { Tooltip } from './tooltip';

// ⌘ on macOS, CTRL on Windows/Linux
function isNavigationEvent(event: KeyboardEvent) {
  if (event.shiftKey || event.altKey || event.repeat) {
    return false;
  }

  const { target } = event;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLDivElement && target.hasAttribute('contenteditable'))
  ) {
    return false;
  }

  if (window.csdm.isMac) {
    return event.metaKey && !event.ctrlKey;
  }

  return event.ctrlKey && !event.metaKey;
}

type NavigationLinkProps = {
  children: React.ReactNode;
  ref?: React.Ref<HTMLAnchorElement>;
  to: string;
  isDisabled: boolean;
};

function NavigationLink({ children, ref, to, isDisabled }: NavigationLinkProps) {
  const { state } = useLocation();

  return (
    <Link
      ref={ref}
      className={`flex items-center h-full ${
        isDisabled ? 'text-gray-600 cursor-default pointer-events-none' : 'text-gray-900 cursor-pointer'
      }`}
      to={to}
      state={state}
      aria-disabled={isDisabled}
      viewTransition={true}
    >
      {children}
    </Link>
  );
}

type Direction = 'left' | 'right';
function useKeyboardNavigation(to: string, direction: Direction) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (to === '') {
      return;
    }

    const directionKey = direction === 'left' ? 'ArrowLeft' : 'ArrowRight';

    const onKeyDown = (event: KeyboardEvent) => {
      if (isNavigationEvent(event) && event.key === directionKey) {
        navigate(to, {
          state: location.state,
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [navigate, to, direction, location.state]);
}

type Props = {
  tooltip: string | ReactNode;
  to: string;
};

export function PreviousLink({ tooltip, to }: Props) {
  useKeyboardNavigation(to, 'left');
  const isDisabled = to === '';
  const link = (
    <NavigationLink to={to} isDisabled={isDisabled}>
      <LeftArrowIcon height={20} />
    </NavigationLink>
  );

  if (isDisabled) {
    return link;
  }

  return <Tooltip content={tooltip}>{link}</Tooltip>;
}

export function NextLink({ tooltip, to }: Props) {
  useKeyboardNavigation(to, 'right');
  const isDisabled = to === '';
  const link = (
    <NavigationLink to={to} isDisabled={isDisabled}>
      <RightArrowIcon height={20} />
    </NavigationLink>
  );

  if (isDisabled) {
    return link;
  }

  return <Tooltip content={tooltip}>{link}</Tooltip>;
}
