import React from 'react';

type Props = {
  className: string;
};

export function TableStatusBarRectangle({ className }: Props) {
  return <div className={`w-28 h-16 rounded ${className}`} />;
}
