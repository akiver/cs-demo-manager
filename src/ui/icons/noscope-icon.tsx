import React from 'react';
import type { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  ref?: React.Ref<SVGSVGElement>;
};

export function NoScopeIcon({ ref, ...props }: Props) {
  return (
    <svg viewBox="0 0 32.074 32.074" enableBackground="new 0 0 32.074 32.074" ref={ref} {...props}>
      <path
        fill="currentColor"
        d="M27.366,15.763c-0.083,1.883-0.603,3.655-1.495,5.194l0.726,0.735c1.144-1.875,1.803-4.077,1.803-6.429c0-6.829-5.557-12.385-12.386-12.385c-2.343,0-4.535,0.654-6.406,1.788l0.73,0.73c1.535-0.886,3.3-1.402,5.176-1.485l1-0.008c5.879,0.257,10.603,4.982,10.86,10.859L27.366,15.763z"
      />
      <polygon fill="currentColor" points="26.406,15.763 20.7,15.763 19.69,14.763 26.395,14.763" />
      <polygon fill="currentColor" points="16.514,4.874 16.514,11.549 15.514,10.598 15.514,4.874" />
      <polygon fill="currentColor" points="5.611,15.763 12.443,15.763 11.448,14.763 5.622,14.763" />
      <path
        fill="currentColor"
        d="M16.514,26.615c1.907-0.084,3.699-0.616,5.252-1.529l0.728,0.728c-1.886,1.163-4.106,1.834-6.48,1.834c-6.829,0-12.386-5.557-12.386-12.386c0-2.371,0.67-4.589,1.83-6.474L6.173,9.54c-0.903,1.546-1.429,3.328-1.512,5.223l-0.008,1c0.257,5.879,4.982,10.603,10.86,10.86L16.514,26.615z"
      />
      <polygon fill="currentColor" points="16.514,25.647 16.514,19.806 15.514,18.841 15.514,25.647" />
      <rect
        x="14.022"
        y="-1.261"
        transform="matrix(0.707 -0.7072 0.7072 0.707 -6.0247 15.7014)"
        fill="currentColor"
        width="3.827"
        height="32.765"
      />
    </svg>
  );
}
