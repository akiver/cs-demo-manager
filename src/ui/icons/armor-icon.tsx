import React from 'react';
import type { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
};

export function ArmorIcon({ size, ...props }: Props) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} {...props}>
      <path
        fill="#fff"
        stroke="#000"
        d="M15.9,31.2c-1.3,0-6.1-1.7-9-4.5c-2.8-2.7-4.4-6-4.4-9.2V1.7c1-0.3,4.3-0.9,13.4-0.9c8.3,0,12.1,0.6,13.4,0.9v15.8c0,3-1.7,6.4-4.6,9.2C21.8,29.5,17.3,31.2,15.9,31.2z"
      />
    </svg>
  );
}
