import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { Tooltip } from 'csdm/ui/components/tooltip';
import type { BombPlanted } from 'csdm/common/types/bomb-planted';
import type { TickOperation, TickPosition } from './select-seconds-dialog';
import { SelectSecondsDialog } from './select-seconds-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { BombIcon } from 'csdm/ui/icons/weapons/bomb-icon';
import { useSequenceForm } from '../use-sequence-form';
import { Tick } from './tick';
import { FocusCameraOnEventSubContextMenu } from './focus-camera-on-event-sub-context-menu';

type ContextMenuProps = {
  bombPlanted: BombPlanted;
};

function BombPlantedContextMenu({ bombPlanted }: ContextMenuProps) {
  const { sequence, setStartTick, setEndTick, setCameraOnPlayerAtTick } = useSequenceForm();
  const { showDialog } = useDialog();

  const showSelectSecondsDialog = (position: TickPosition, operation: TickOperation) => {
    showDialog(
      <SelectSecondsDialog
        tick={bombPlanted.tick}
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
    setStartTick(bombPlanted.tick);
  };
  const onSetAsStartTickMinusSecondsClick = () => {
    showSelectSecondsDialog('start', 'minus');
  };
  const onSetAsStartTickPlusSecondsClick = () => {
    showSelectSecondsDialog('start', 'plus');
  };
  const onSetAsEndTickClick = () => {
    setEndTick(bombPlanted.tick);
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
          eventTick={bombPlanted.tick}
          startTick={Number(sequence.startTick)}
          label={<Trans context="Context menu">Focus camera on planter</Trans>}
          onSubmit={(tick) => {
            setCameraOnPlayerAtTick({
              tick,
              playerSteamId: bombPlanted.planterSteamId,
            });
          }}
        />
        <Separator />
        <ContextMenuItem onClick={onSetAsStartTickClick}>
          <Trans context="Context menu">Set the tick of the bomb planted as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb planted minus X seconds as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb planted plus X seconds as start tick</Trans>
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem onClick={onSetAsEndTickClick}>
          <Trans context="Context menu">Set the tick of the bomb planted as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb planted minus X seconds as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb planted plus X seconds as end tick</Trans>
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}

type TooltipProps = {
  bombPlanted: BombPlanted;
};

function TooltipContent({ bombPlanted }: TooltipProps) {
  const { tick, planterName, site } = bombPlanted;
  return (
    <div className="flex flex-col">
      <Tick tick={tick} />
      <p>
        <Trans context="Tooltip">
          Bomb planted by <strong>{planterName}</strong> on site <strong>{site}</strong>
        </Trans>
      </p>
    </div>
  );
}

type Props = {
  bombPlanted: BombPlanted;
  iconSize: number;
};

export function BombPlantedItem({ iconSize, bombPlanted }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <BombPlantedContextMenu bombPlanted={bombPlanted} />);
  };

  return (
    <Tooltip content={<TooltipContent bombPlanted={bombPlanted} />} placement="top" renderInPortal={true}>
      <div style={scaleStyle} onContextMenu={onContextMenu}>
        <BombIcon size={iconSize} className="fill-red-700" />
      </div>
    </Tooltip>
  );
}
