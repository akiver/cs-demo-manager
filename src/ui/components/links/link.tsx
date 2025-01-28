import React from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink, type To } from 'react-router';

type Props = {
  children: ReactNode;
  to: To;
};

export function Link({ children, to, ...props }: Props) {
  return (
    <RouterLink
      className="px-12 leading-none whitespace-nowrap rounded border flex items-center duration-85 transition-all relative cursor-default h-[30px] aria-disabled:bg-gray-300 aria-disabled:text-gray-600 aria-disabled:border-transparent bg-gray-50 border-gray-400 text-gray-800 active:bg-gray-200 hover:text-gray-900 hover:border-gray-900 focus:border-gray-800 focus-visible:outline-hidden"
      to={to}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
