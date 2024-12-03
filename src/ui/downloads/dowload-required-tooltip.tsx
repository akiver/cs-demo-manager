import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';

type Props = {
  children: ReactNode;
};

export function DownloadRequiredTooltip({ children }: Props) {
  return (
    <Tooltip content={<Trans context="Tooltip">You must download the demo first</Trans>} placement="top">
      <div>{children}</div>
    </Tooltip>
  );
}
