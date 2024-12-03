import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useClipboard } from 'csdm/ui/hooks/use-clipboard';

type Props = {
  steamId: string;
};

export function CopyCrosshairShareCode({ steamId }: Props) {
  const match = useCurrentMatch();
  const { copyToClipboard } = useClipboard();
  const player = match.players.find((player) => {
    return player.steamId === steamId;
  });

  if (player === undefined) {
    return null;
  }

  const crosshairShareCode = player.crosshairShareCode;
  if (crosshairShareCode === null) {
    return null;
  }

  const onClick = () => {
    copyToClipboard(crosshairShareCode);
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu sub item">Crosshair share code</Trans>
    </ContextMenuItem>
  );
}
