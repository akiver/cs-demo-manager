import type { SVGAttributes } from 'react';
import React from 'react';

type Props = SVGAttributes<SVGElement>;

export function StarIcon(props: Props) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <path d="m15.948.904 4.848 11.221h10.882L22.8 19.546l3.784 11.624-10.636-6.876-10.29 6.876L8.85 19.546.288 12.15l11.335-.025z" />
    </svg>
  );
}
