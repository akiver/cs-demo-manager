import React from 'react';
import { Trans } from '@lingui/macro';
import { ContextMenuItem } from '../context-menu-item';
import { SHOW_COMMENT_SHORTCUT } from 'csdm/ui/keyboard/keyboard-shortcut';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type CommentItemProps = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function CommentItem({ onClick, isDisabled = false }: CommentItemProps) {
  const _ = useI18n();

  return (
    <ContextMenuItem onClick={onClick} isDisabled={isDisabled}>
      <p>
        <Trans context="Context menu">Comment</Trans>
      </p>
      <p className="text-caption">{_(SHOW_COMMENT_SHORTCUT.label)}</p>
    </ContextMenuItem>
  );
}
