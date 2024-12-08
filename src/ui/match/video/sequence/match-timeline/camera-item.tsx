import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { useSequenceForm } from '../use-sequence-form';
import type { CameraFocus } from 'csdm/common/types/camera-focus';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { getSequencePlayerColor } from '../get-sequence-player-color';
import { Tick } from './tick';

type ContextMenuProps = {
  tick: number;
};

function CameraContextMenu({ tick }: ContextMenuProps) {
  const { removeCameraAtTick } = useSequenceForm();

  return (
    <>
      <ContextMenu>
        <ContextMenuItem
          onClick={() => {
            removeCameraAtTick(tick);
          }}
        >
          <Trans context="Context menu">Remove</Trans>
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}

type TooltipProps = {
  camera: CameraFocus;
};

function TooltipContent({ camera }: TooltipProps) {
  const { tick, playerName } = camera;

  return (
    <div className="flex flex-col">
      <Tick tick={tick} />
      <p>
        <Trans>
          Camera on <strong>{playerName}</strong>
        </Trans>
      </p>
    </div>
  );
}

type Props = {
  camera: CameraFocus;
};

export function CameraItem({ camera }: Props) {
  const match = useCurrentMatch();
  const { showContextMenu } = useContextMenu();

  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <CameraContextMenu tick={camera.tick} />);
  };

  const playerIndex = match.players.findIndex((player) => player.steamId === camera.playerSteamId);
  if (playerIndex === -1) {
    return null;
  }

  return (
    <Tooltip content={<TooltipContent camera={camera} />} placement="top" renderInPortal={true}>
      <div
        className="size-12 rounded-full"
        style={{
          ...scaleStyle,
          backgroundColor: getSequencePlayerColor(playerIndex),
        }}
        onContextMenu={onContextMenu}
      />
    </Tooltip>
  );
}
