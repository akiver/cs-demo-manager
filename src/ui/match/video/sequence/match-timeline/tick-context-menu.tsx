import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useSequenceForm } from '../use-sequence-form';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';

type Props = {
  tick: number;
};

export function TickContextMenu({ tick }: Props) {
  const { updateSequence, sequence } = useSequenceForm();
  const match = useCurrentMatch();
  const onStartClick = () => {
    updateSequence({
      startTick: String(tick),
    });
  };
  const onEndClick = () => {
    updateSequence({
      endTick: String(tick),
    });
  };

  const onFocusCameraOnPlayerClick = (steamId: string) => {
    const steamIds = sequence.cameraFocus[tick] ?? [];
    if (!steamIds.includes(steamId)) {
      steamIds.push(steamId);
    }

    updateSequence({
      cameraFocus: {
        ...sequence.cameraFocus,
        [tick]: steamIds,
      },
    });
  };

  return (
    <ContextMenu>
      <ContextMenuItem onClick={onStartClick}>
        <Trans context="Context menu">Set tick {tick} as start tick</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onEndClick}>
        <Trans context="Context menu">Set tick {tick} as end tick</Trans>
      </ContextMenuItem>
      <SubContextMenu label={<Trans context="Context menu">Focus camera</Trans>}>
        {match.players.map((player) => {
          return (
            <ContextMenuItem
              key={player.steamId}
              onClick={() => {
                onFocusCameraOnPlayerClick(player.steamId);
              }}
            >
              {player.name}
            </ContextMenuItem>
          );
        })}
      </SubContextMenu>
    </ContextMenu>
  );
}
