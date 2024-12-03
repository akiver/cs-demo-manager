import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { PanelValue } from 'csdm/ui/components/panel';

type Props = {
  title?: ReactNode;
  value: number;
  barClassName?: string;
};

export function WinRate({ title, value, barClassName }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <p>{title ?? <Trans>Win rate</Trans>}</p>
        <PanelValue>{`${value}%`}</PanelValue>
      </div>
      <div className="h-4 rounded-full w-full bg-gray-200">
        <div
          className={`h-4 rounded-full ${barClassName ?? 'bg-gray-800'}`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}
