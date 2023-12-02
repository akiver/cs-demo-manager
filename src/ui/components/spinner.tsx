import React from 'react';

type Props = {
  size: number;
};

export const Spinner = React.forwardRef(function Spinner({ size }: Props, ref: React.Ref<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      className="border-4 border-gray-800 border-t-gray-400 rounded-full animate-spin"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
});
