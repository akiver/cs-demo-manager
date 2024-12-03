import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  onClick: () => void;
};

export function DetailsItem({ onClick }: Props) {
  const { t } = useLingui();

  return (
    <ContextMenuItem onClick={onClick}>
      <p>
        <Trans context="Context menu">Details</Trans>
      </p>
      <p className="text-caption">
        {window.csdm.isMac
          ? '⌘+↓'
          : t({
              context: 'Keyboard shortcut',
              message: 'Enter',
            })}
      </p>
    </ContextMenuItem>
  );
}
