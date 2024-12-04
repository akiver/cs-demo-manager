import React from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { buildPlayerMatchesPath } from 'csdm/ui/routes-paths';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  steamIds: string[];
};

export function ShowPlayerMatchesItem({ steamIds }: Props) {
  const navigate = useNavigate();

  const onClick = () => {
    const url = buildPlayerMatchesPath(steamIds[0]);
    navigate(url);
  };

  return (
    <ContextMenuItem onClick={onClick} isDisabled={steamIds.length === 0}>
      <Trans context="Context menu">Show matches</Trans>
    </ContextMenuItem>
  );
}
