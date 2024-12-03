import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  shareCodes: string[];
};

export function CopyShareCodeItem({ shareCodes }: Props) {
  const onClick = () => {
    navigator.clipboard.writeText(shareCodes.join('\n'));
  };
  const isDisabled = shareCodes.includes('');

  return (
    <ContextMenuItem onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Copy context menu">Share code</Trans>
    </ContextMenuItem>
  );
}
