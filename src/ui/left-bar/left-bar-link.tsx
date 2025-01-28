import type { ReactNode } from 'react';
import React from 'react';
import { NavLink } from 'react-router';
import { LeftBarTooltip } from './left-bar-tooltip';

type Props = {
  icon: ReactNode;
  tooltip: ReactNode;
  url: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

export function LeftBarLink({ url, tooltip, icon, onClick }: Props) {
  return (
    <LeftBarTooltip content={tooltip}>
      <NavLink
        to={url}
        onClick={onClick}
        className={({ isActive }) => {
          return `flex flex-col items-center w-full no-underline hover:text-gray-900 duration-85 transition-all py-12 outline-hidden ${
            isActive ? 'text-gray-900' : 'text-gray-500'
          }`;
        }}
        viewTransition={true}
      >
        <div className="flex justify-center w-32">{icon}</div>
      </NavLink>
    </LeftBarTooltip>
  );
}
