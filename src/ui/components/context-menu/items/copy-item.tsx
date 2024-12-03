import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';

type Props = {
  children: ReactNode;
};

export function CopyItem({ children }: Props) {
  return <SubContextMenu label={<Trans context="Context menu">Copy</Trans>}>{children}</SubContextMenu>;
}
