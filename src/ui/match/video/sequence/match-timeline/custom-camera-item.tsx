import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { useSequenceForm } from '../use-sequence-form';
import { Tick } from './tick';
import type { CustomCameraFocus } from 'csdm/common/types/custom-camera-focus';

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
  camera: CustomCameraFocus;
};

function TooltipContent({ camera }: TooltipProps) {
  const { tick, name } = camera;

  return (
    <div className="flex flex-col">
      <Tick tick={tick} />
      <p>
        <strong>{name}</strong>
      </p>
    </div>
  );
}

type Props = {
  camera: CustomCameraFocus;
};

export function CameraItem({ camera }: Props) {
  const { showContextMenu } = useContextMenu();

  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <CameraContextMenu tick={camera.tick} />);
  };

  return (
    <Tooltip content={<TooltipContent camera={camera} />} placement="top" renderInPortal={true}>
      <div
        className="size-12 rounded-full"
        style={{
          ...scaleStyle,
          backgroundColor: camera.color,
        }}
        onContextMenu={onContextMenu}
      />
    </Tooltip>
  );
}
