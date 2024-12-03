import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  onClick: () => void;
};

export function RenameItem({ onClick }: Props) {
  const { t } = useLingui();

  return (
    <ContextMenuItem onClick={onClick}>
      <p>
        <Trans context="Context menu">Rename</Trans>
      </p>
      <p className="text-caption">
        {window.csdm.isMac
          ? t({
              context: 'Keyboard shortcut',
              message: 'Enter',
            })
          : 'F2'}
      </p>
    </ContextMenuItem>
  );
}
