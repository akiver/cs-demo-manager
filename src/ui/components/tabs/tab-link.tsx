import type { ReactNode } from 'react';
import React from 'react';
import { NavLink, useLocation } from 'react-router';

type Props = {
  url: string;
  children: ReactNode;
  end?: boolean;
};

export function TabLink({ children, url, end = true }: Props) {
  const { state } = useLocation();

  return (
    <NavLink
      to={url}
      end={end}
      state={state}
      className={({ isActive }) => {
        return `relative flex items-center h-full px-8 no-underline text-body-strong text-gray-900 hover:opacity-100 min-w-fit ${
          isActive ? '' : 'opacity-60'
        }`;
      }}
      viewTransition={true}
    >
      {children}
    </NavLink>
  );
}
