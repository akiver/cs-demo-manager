import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useSequenceForm } from '../use-sequence-form';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { getSequencePlayerColor } from '../get-sequence-player-color';
import { useCameras } from 'csdm/ui/cameras/use-cameras';

type Props = {
  tick: number;
};

export function TickContextMenu({ tick }: Props) {
  const { setStartTick, setEndTick, setCameraAtTick, setCameraOnPlayerAtTick } = useSequenceForm();
  const match = useCurrentMatch();
  const cameras = useCameras(match.game, match.mapName);

  return (
    <ContextMenu>
      <SubContextMenu label={<Trans context="Context menu">Set tick {tick} as</Trans>}>
        <ContextMenuItem
          onClick={() => {
            setStartTick(tick);
          }}
        >
          <Trans context="Context menu">Start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            setEndTick(tick);
          }}
        >
          <Trans context="Context menu">End tick</Trans>
        </ContextMenuItem>
      </SubContextMenu>
      <SubContextMenu label={<Trans context="Context menu">Focus camera</Trans>}>
        {match.players.map((player, index) => {
          return (
            <ContextMenuItem
              key={player.steamId}
              onClick={() => {
                setCameraOnPlayerAtTick({
                  tick,
                  playerSteamId: player.steamId,
                });
              }}
            >
              <div className="flex items-center gap-x-12">
                <div className="size-12 rounded-full" style={{ backgroundColor: getSequencePlayerColor(index) }} />
                <span>{player.name}</span>
              </div>
            </ContextMenuItem>
          );
        })}
      </SubContextMenu>
      {cameras.length > 0 && (
        <SubContextMenu label={<Trans context="Context menu">Set camera</Trans>}>
          {cameras.map((camera) => {
            return (
              <ContextMenuItem
                key={camera.id}
                onClick={() => {
                  setCameraAtTick({
                    tick,
                    cameraId: camera.id,
                  });
                }}
              >
                <div className="flex items-center gap-x-12">
                  <div className="size-12 rounded-full" style={{ backgroundColor: camera.color }} />
                  <p className="max-w-[300px] truncate" title={camera.name}>
                    {camera.name}
                  </p>
                </div>
              </ContextMenuItem>
            );
          })}
        </SubContextMenu>
      )}
    </ContextMenu>
  );
}
