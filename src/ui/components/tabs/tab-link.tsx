import type { ReactNode } from 'react';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

type Props = {
  url: string;
  text: ReactNode | string;
  end?: boolean;
};

export function TabLink({ text, url, end = true }: Props) {
  const { state } = useLocation();

  return (
    <NavLink
      to={url}
      end={end}
      state={state}
      className={({ isActive }) => {
        return `flex items-center h-full px-8 no-underline text-body-strong text-gray-900 hover:opacity-100 min-w-fit ${
          isActive ? '' : 'opacity-60'
        }`;
      }}
      unstable_viewTransition={true}
    >
      {text}
    </NavLink>
  );
}
