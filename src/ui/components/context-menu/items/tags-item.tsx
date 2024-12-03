import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  onClick: () => void;
};

export function TagsItem({ onClick }: Props) {
  return (
    <ContextMenuItem onClick={onClick}>
      <p>
        <Trans context="Context menu">Tags</Trans>
      </p>
      <p className="text-caption">T</p>
    </ContextMenuItem>
  );
}
