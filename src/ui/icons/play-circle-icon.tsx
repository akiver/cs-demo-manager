import type { SVGAttributes } from 'react';
import React from 'react';

type Props = SVGAttributes<SVGElement>;

export function PlayCircleIcon(props: Props) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <path d="M16.017.597C7.494.597.583 7.507.583 16.031s6.91 15.434 15.434 15.434 15.435-6.91 15.435-15.434S24.541.597 16.017.597zm6.9 16.004-10.793 4.997a.62.62 0 0 1-.603-.04.627.627 0 0 1-.289-.529v-9.995a.626.626 0 0 1 .892-.57l10.793 4.998c.223.102.364.324.364.569s-.141.468-.364.57z" />
    </svg>
  );
}
