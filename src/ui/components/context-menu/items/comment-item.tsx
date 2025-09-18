import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from '../context-menu-item';
import { showCommentKey } from 'csdm/ui/keyboard/keyboard-shortcut';

type CommentItemProps = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function CommentItem({ onClick, isDisabled = false }: CommentItemProps) {
  return (
    <ContextMenuItem onClick={onClick} isDisabled={isDisabled}>
      <p>
        <Trans context="Context menu">Comment</Trans>
      </p>
      <p className="text-caption">{showCommentKey}</p>
    </ContextMenuItem>
  );
}
