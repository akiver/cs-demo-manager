import React from 'react';
import clsx from 'clsx';

type Props = {
  className: string;
};

export function TableStatusBarRectangle({ className }: Props) {
  return <div className={clsx('h-16 w-28 rounded', className)} />;
}
