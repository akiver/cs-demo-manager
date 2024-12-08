import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DefuserIcon } from 'csdm/ui/icons/weapons/defuser-icon';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { Tooltip } from 'csdm/ui/components/tooltip';
import type { BombDefused } from 'csdm/common/types/bomb-defused';
import type { TickOperation, TickPosition } from './select-seconds-dialog';
import { SelectSecondsDialog } from './select-seconds-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useSequenceForm } from '../use-sequence-form';
import { Tick } from './tick';
import { FocusCameraOnEventSubContextMenu } from './focus-camera-on-event-sub-context-menu';

type ContextMenuProps = {
  bombDefused: BombDefused;
};

function BombDefusedContextMenu({ bombDefused }: ContextMenuProps) {
  const { sequence, setStartTick, setEndTick, setCameraOnPlayerAtTick } = useSequenceForm();
  const { showDialog } = useDialog();
  const showSelectSecondsDialog = (position: TickPosition, operation: TickOperation) => {
    showDialog(
      <SelectSecondsDialog
        tick={bombDefused.tick}
        operation={operation}
        onSubmit={(tick) => {
          if (position === 'start') {
            setStartTick(tick);
          } else {
            setEndTick(tick);
          }
        }}
      />,
    );
  };
  const onSetAsStartTickClick = () => {
    setStartTick(bombDefused.tick);
  };
  const onSetAsStartTickMinusSecondsClick = () => {
    showSelectSecondsDialog('start', 'minus');
  };
  const onSetAsStartTickPlusSecondsClick = () => {
    showSelectSecondsDialog('start', 'plus');
  };
  const onSetAsEndTickClick = () => {
    setEndTick(bombDefused.tick);
  };
  const onSetAsEndTickMinusSecondsClick = () => {
    showSelectSecondsDialog('end', 'minus');
  };
  const onSetAsEndTickPlusSecondsClick = () => {
    showSelectSecondsDialog('end', 'plus');
  };

  return (
    <>
      <ContextMenu>
        <FocusCameraOnEventSubContextMenu
          eventTick={bombDefused.tick}
          startTick={Number(sequence.startTick)}
          label={<Trans context="Context menu">Focus camera on defuser</Trans>}
          onSubmit={(tick) => {
            setCameraOnPlayerAtTick({
              tick,
              playerSteamId: bombDefused.defuserSteamId,
            });
          }}
        />
        <Separator />
        <ContextMenuItem onClick={onSetAsStartTickClick}>
          <Trans context="Context menu">Set the tick of the bomb defused as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb defused minus X seconds as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb defused plus X seconds as start tick</Trans>
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem onClick={onSetAsEndTickClick}>
          <Trans context="Context menu">Set the tick of the bomb defused as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb defused minus X seconds as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb defused plus X seconds as end tick</Trans>
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}

type TooltipProps = {
  bombDefused: BombDefused;
};

function TooltipContent({ bombDefused }: TooltipProps) {
  const { tick, defuserName, site } = bombDefused;
  return (
    <div className="flex flex-col">
      <Tick tick={tick} />
      <p>
        <Trans>
          Bomb defused by <strong>{defuserName}</strong> on site <strong>{site}</strong>
        </Trans>
      </p>
    </div>
  );
}

type Props = {
  bombDefused: BombDefused;
  iconSize: number;
};

export function BombDefusedItem({ iconSize, bombDefused }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <BombDefusedContextMenu bombDefused={bombDefused} />);
  };

  return (
    <Tooltip content={<TooltipContent bombDefused={bombDefused} />} placement="top" renderInPortal={true}>
      <div style={scaleStyle} onContextMenu={onContextMenu}>
        <DefuserIcon width={iconSize} height={iconSize} className="text-ct" />
      </div>
    </Tooltip>
  );
}
