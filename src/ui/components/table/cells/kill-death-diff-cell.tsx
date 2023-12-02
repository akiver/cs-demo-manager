import React from 'react';
import type { CellProps } from '../table-types';

type Props = CellProps<{ killCount: number; deathCount: number }>;

export function KillDeathDiffCell({ data }: Props) {
  const diff = data.killCount - data.deathCount;
  const text = diff > 0 ? `+${diff}` : diff.toString();

  return (
    <span className={`selectable ${diff === 0 ? 'text-gray-800' : diff > 0 ? 'text-green-700' : 'text-red-400'}`}>
      {text}
    </span>
  );
}
