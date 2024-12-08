import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { isCounterStrikeStartable } from 'csdm/ui/hooks/use-counter-strike';
import { useCurrentMatch } from '../../use-current-match';
import type { Kill } from 'csdm/common/types/kill';
import { useNavigateToMatchPlayer } from 'csdm/ui/hooks/navigation/use-navigate-to-match-player';
import { AddToVideoSequencesItem } from 'csdm/ui/components/context-menu/items/add-to-video-sequences-item';

type Props = {
  kill: Kill;
  onWatchClick: (kill: Kill) => Promise<void>;
};

export function OpeningDuelContextMenu({ kill, onWatchClick }: Props) {
  const match = useCurrentMatch();
  const navigateToMatchPlayer = useNavigateToMatchPlayer();

  return (
    <ContextMenu>
      {isCounterStrikeStartable(match.game) && (
        <ContextMenuItem
          onClick={() => {
            onWatchClick(kill);
          }}
        >
          {<Trans context="Context menu">Watch</Trans>}
        </ContextMenuItem>
      )}
      {kill.killerSteamId !== '0' && (
        <ContextMenuItem
          onClick={() => {
            navigateToMatchPlayer(match.checksum, kill.killerSteamId);
          }}
        >
          {<Trans context="Context menu">See killer details</Trans>}
        </ContextMenuItem>
      )}
      {kill.victimSteamId !== '0' && (
        <ContextMenuItem
          onClick={() => {
            navigateToMatchPlayer(match.checksum, kill.victimSteamId);
          }}
        >
          {<Trans context="Context menu">See victim details</Trans>}
        </ContextMenuItem>
      )}
      <AddToVideoSequencesItem
        startTick={kill.tick - Math.round(match.tickrate * 5)}
        endTick={kill.tick + Math.round(match.tickrate * 2)}
        playerFocusSteamId={kill.killerSteamId}
        playerFocusName={kill.killerName}
      />
    </ContextMenu>
  );
}
