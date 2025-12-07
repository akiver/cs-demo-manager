import React from 'react';

type Props = {
  className?: string;
};

export function RenownLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 62 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        id="right"
        d="M61.578 12.3159H40.052L33.1569 20.5865H42.2382L35.3432 28.2932L42.2382 35.9998H55.5238L47.956 27.5413L61.578 12.3159Z"
        fill="currentColor"
      />
      <path
        id="crown"
        d="M30.3164 17.9998L24.6322 11.6807L30.3164 0L36.0006 11.6807L30.3164 17.9998Z"
        fill="url(#gradient)"
      />
      <path
        id="left"
        d="M8.7738e-05 12.3159H20.8085L27.4738 20.5865H18.6952L25.3604 28.2932L18.6952 35.9998H5.85247L13.1679 27.5413L8.7738e-05 12.3159Z"
        fill="currentColor"
      />

      <defs>
        <linearGradient id="gradient" x1="23.0615" y1="0" x2="33.7051" y2="-7.00734e-10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF94AB" />
          <stop offset="1" stopColor="#FFA576" />
        </linearGradient>
      </defs>
    </svg>
  );
}
