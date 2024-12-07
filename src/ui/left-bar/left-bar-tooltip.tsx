import type { ReactNode } from 'react';
import React from 'react';
import { Tooltip } from 'csdm/ui/components/tooltip';

type Props = {
  children: React.ReactElement<Record<string, unknown>>;
  content: ReactNode;
};

export function LeftBarTooltip({ children, content }: Props) {
  return (
    <Tooltip content={content} placement="right">
      {children}
    </Tooltip>
  );
}
