import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  checksums: string[];
};

export function CopyChecksumsItem({ checksums }: Props) {
  const onClick = () => {
    navigator.clipboard.writeText(checksums.join(','));
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Copy context menu">Checksum</Trans>
    </ContextMenuItem>
  );
}
