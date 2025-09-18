import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function HeatmapFilters({ children }: Props) {
  return <div className="mr-16 flex w-[400px] flex-col gap-y-12">{children}</div>;
}
