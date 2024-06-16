import type { SVGAttributes } from 'react';
import React from 'react';

type Props = SVGAttributes<SVGElement>;

export function VideoIcon(props: Props) {
  return (
    <svg viewBox="0 0 8 8" {...props}>
      <path
        d="m.5 0c-.28 0-.5.23-.5.5v4c0 .28.23.5.5.5h5c.28 0 .5-.22.5-.5v-1.5l1 1h1v-3h-1l-1 1v-1.5c0-.28-.22-.5-.5-.5z"
        transform="translate(0 1)"
      />
    </svg>
  );
}
