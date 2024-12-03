import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  filepaths: string[];
};

export function CopyFilepathItem({ filepaths }: Props) {
  const onClick = () => {
    navigator.clipboard.writeText(filepaths.join('\n'));
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Copy context menu">File path</Trans>
    </ContextMenuItem>
  );
}
