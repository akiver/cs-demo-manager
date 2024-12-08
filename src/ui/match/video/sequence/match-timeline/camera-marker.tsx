import React from 'react';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { Trans, useLingui } from '@lingui/react/macro';
import { VideoIcon } from 'csdm/ui/icons/video-icon';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useSequenceForm } from '../use-sequence-form';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';

type PlayerInfo = { steamId: string; name: string };

type CameraContextMenuProps = {
  tick: number;
  players: PlayerInfo[];
};

function CameraContextMenu({ tick, players }: CameraContextMenuProps) {
  const { updateSequence, sequence } = useSequenceForm();

  return (
    <ContextMenu>
      {players.map((player) => {
        const playerName = player.name;
        return (
          <ContextMenuItem
            key={player.steamId}
            onClick={() => {
              const steamIds = sequence.cameraFocus[tick] ?? [];
              updateSequence({
                cameraFocus: {
                  ...sequence.cameraFocus,
                  [tick]: steamIds.filter((steamId) => steamId !== player.steamId),
                },
              });
            }}
          >
            <Trans context="Context menu">Remove {playerName}</Trans>
          </ContextMenuItem>
        );
      })}
    </ContextMenu>
  );
}

type Props = {
  tick: number;
  pixelsPerTick: number;
  steamIds: string[];
};

export function CameraMarker({ tick, pixelsPerTick, steamIds }: Props) {
  const { t } = useLingui();
  const match = useCurrentMatch();
  const { showContextMenu } = useContextMenu();

  const x = tick * pixelsPerTick;

  const players: PlayerInfo[] = [];
  for (const steamId of steamIds) {
    const player = match.players.find((player) => player.steamId === steamId);
    if (player !== undefined) {
      players.push({ steamId, name: player.name });
    }
  }

  const playerNames = players.map((player) => player.name).join(', ');
  const text = t({
    context: 'Camera marker tooltip',
    message: `${tick}: camera on ${playerNames}`,
  });

  return (
    <Tooltip content={text} delay={10} renderInPortal={true}>
      <div
        className="absolute w-px h-full bg-orange-400 z-1"
        style={{
          ...scaleStyle,
          left: `${x}px`,
        }}
      >
        <div
          className="absolute pl-4 flex items-center size-24 bottom-0 bg-gray-300 rounded-r text-gray-900"
          onContextMenu={(event) => {
            event.stopPropagation();
            showContextMenu(event.nativeEvent, <CameraContextMenu tick={tick} players={players} />);
          }}
        >
          <VideoIcon className="size-16" />
        </div>
      </div>
    </Tooltip>
  );
}
