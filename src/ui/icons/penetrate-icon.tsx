import type { SVGAttributes } from 'react';
import React from 'react';

type Props = SVGAttributes<SVGElement> & {
  ref?: React.Ref<SVGSVGElement>;
};

export function PenetrateIcon({ ref, ...props }: Props) {
  return (
    <svg viewBox="0 0 32 32" ref={ref} {...props}>
      <g>
        <path d="M2.416 3.535v24.786l11.387 2.847V.604L2.416 3.535zM7.73 15.129c-1.271 0-2.302-1.855-2.302-4.144S6.459 6.841 7.73 6.841c1.271 0 2.301 1.855 2.301 4.144 0 2.288-1.031 4.144-2.301 4.144zM27.349 10.765h2.591v.709h-2.591zM26.652 9.86l1.446-1.464.503.497-1.446 1.464zM26.866 12.473l.497-.503 1.463 1.447-.497.503zM25.797 13.025l.639-.304.59 1.238-.64.304zM25.693 9.096l.737-1.155.596.38-.738 1.156zM16.362 12.138l7.997.004 2.054-1.137-2.164-1.042h-7.887v2.175z" />
      </g>
    </svg>
  );
}
