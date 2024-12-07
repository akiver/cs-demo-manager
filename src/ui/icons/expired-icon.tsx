import type { SVGAttributes } from 'react';
import React from 'react';

type Props = SVGAttributes<SVGElement> & {
  ref?: React.Ref<SVGSVGElement>;
};

export function ExpiredIcon({ ref, ...props }: Props) {
  return (
    <svg viewBox="0 0 100 100" ref={ref} {...props}>
      <polygon points="48.87 18.19 42.87 18.19 42.87 43.15 26.5 43.15 26.5 49.15 48.87 49.15 48.87 18.19" />
      <path d="M87.55,53.17A42.84,42.84,0,1,0,53.17,87.55,24.57,24.57,0,1,0,87.55,53.17ZM45.42,82.26A36.84,36.84,0,1,1,82.26,45.42,37.29,37.29,0,0,1,82,50,24.56,24.56,0,0,0,50,82,37.26,37.26,0,0,1,45.42,82.26Zm27.42,9.16A18.58,18.58,0,1,1,91.42,72.85,18.6,18.6,0,0,1,72.85,91.42Z" />
    </svg>
  );
}
