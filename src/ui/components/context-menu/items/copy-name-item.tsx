import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useClipboard } from 'csdm/ui/hooks/use-clipboard';

type Props = {
  names: string[];
};

export function CopyNameItem({ names }: Props) {
  const { copyToClipboard } = useClipboard();

  const onClick = () => {
    copyToClipboard(names.join(','));
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Copy name</Trans>
    </ContextMenuItem>
  );
}
