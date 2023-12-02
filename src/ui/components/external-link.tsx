import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
  href: string;
};

export function ExternalLink({ href, children }: Props) {
  return (
    <a className="text-blue-500 no-underline hover:underline" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
