import React from 'react';
import type { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  ref?: React.Ref<SVGSVGElement>;
};

export function JumpIcon({ ref, ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" ref={ref} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="4">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8 10l12 10.254v9.714L10.857 44M40 10L28 20.254v9.714L37.143 44"
        />
        <circle cx="24" cy="8" r="4" fill="currentColor" />
      </g>
    </svg>
  );
}
