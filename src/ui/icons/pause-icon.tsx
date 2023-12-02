import type { SVGAttributes } from 'react';
import React from 'react';

type Props = SVGAttributes<SVGElement>;

export function PauseIcon(props: Props) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <g>
        <path d="M6.267 3.77h6.206v24.833H6.267zM19.528 3.77h6.206v24.833h-6.206z" />
      </g>
    </svg>
  );
}
