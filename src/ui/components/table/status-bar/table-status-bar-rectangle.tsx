import React from 'react';
import clsx from 'clsx';

type Props = {
  className: string;
};

export function TableStatusBarRectangle({ className }: Props) {
  return <div className={clsx('w-28 h-16 rounded', className)} />;
}
