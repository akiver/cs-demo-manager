import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';
import { useCurrentMatch } from '../../use-current-match';
import { isCounterStrikeStartable } from 'csdm/ui/hooks/use-counter-strike';

type Props = {
  grenadeThrow: GrenadeThrow | undefined;
  onWatchClick: () => Promise<void>;
};

export function GrenadesFinderContextMenu({ grenadeThrow, onWatchClick }: Props) {
  const match = useCurrentMatch();
  const onCopyPositionClick = () => {
    if (grenadeThrow === undefined || grenadeThrow.positions.length === 0) {
      return;
    }

    const [firstPosition] = grenadeThrow.positions;
    const command = `setpos ${firstPosition.x} ${firstPosition.y} ${firstPosition.z}; setang ${grenadeThrow.throwerPitch} ${grenadeThrow.throwerYaw}`;
    navigator.clipboard.writeText(command);
  };

  return (
    <ContextMenu>
      <ContextMenuItem onClick={onCopyPositionClick}>
        {<Trans context="Context menu">Copy position</Trans>}
      </ContextMenuItem>
      {isCounterStrikeStartable(match.game) && (
        <ContextMenuItem onClick={onWatchClick}>{<Trans context="Context menu">Watch</Trans>}</ContextMenuItem>
      )}
    </ContextMenu>
  );
}
