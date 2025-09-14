import React from 'react';

type Props = {
  ref?: React.Ref<HTMLDivElement>;
  size: number;
};

export function Spinner({ ref, size }: Props) {
  return (
    <div
      ref={ref}
      className="animate-spin rounded-full border-4 border-gray-800 border-t-gray-400"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
}
