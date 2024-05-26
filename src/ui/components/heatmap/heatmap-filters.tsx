import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function HeatmapFilters({ children }: Props) {
  return <div className="flex flex-col w-[400px] gap-y-12 mr-16">{children}</div>;
}
