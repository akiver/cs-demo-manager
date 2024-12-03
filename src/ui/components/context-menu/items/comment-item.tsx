import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ContextMenuItem } from '../context-menu-item';
import { SHOW_COMMENT_SHORTCUT } from 'csdm/ui/keyboard/keyboard-shortcut';

type CommentItemProps = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function CommentItem({ onClick, isDisabled = false }: CommentItemProps) {
  const { t } = useLingui();

  return (
    <ContextMenuItem onClick={onClick} isDisabled={isDisabled}>
      <p>
        <Trans context="Context menu">Comment</Trans>
      </p>
      <p className="text-caption">{t(SHOW_COMMENT_SHORTCUT.label)}</p>
    </ContextMenuItem>
  );
}
