import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExplosionIcon } from 'csdm/ui/icons/explosion-icon';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { Tooltip } from 'csdm/ui/components/tooltip';
import type { BombExploded } from 'csdm/common/types/bomb-exploded';
import type { TickOperation, TickPosition } from './select-seconds-dialog';
import { SelectSecondsDialog } from './select-seconds-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useSequenceForm } from '../use-sequence-form';

type ContextMenuProps = {
  bombExploded: BombExploded;
};

function BombExplodedContextMenu({ bombExploded }: ContextMenuProps) {
  const { updateSequence } = useSequenceForm();
  const { showDialog } = useDialog();
  const showSelectSecondsDialog = (position: TickPosition, operation: TickOperation) => {
    showDialog(
      <SelectSecondsDialog
        tick={bombExploded.tick}
        tickPosition={position}
        operation={operation}
        updateSequence={updateSequence}
      />,
    );
  };

  const onSetAsStartTickClick = () => {
    updateSequence({
      startTick: String(bombExploded.tick),
    });
  };
  const onSetAsStartTickMinusSecondsClick = () => {
    showSelectSecondsDialog('start', 'minus');
  };
  const onSetAsStartTickPlusSecondsClick = () => {
    showSelectSecondsDialog('start', 'plus');
  };
  const onSetAsEndTickClick = () => {
    updateSequence({
      endTick: String(bombExploded.tick),
    });
  };
  const onSetAsEndTickMinusSecondsClick = () => {
    showSelectSecondsDialog('end', 'minus');
  };
  const onSetAsEndTickPlusSecondsClick = () => {
    showSelectSecondsDialog('end', 'plus');
  };
  const onFocusCameraOnPlanterClick = () => {
    updateSequence({
      playerFocusSteamId: bombExploded.planterSteamId,
    });
  };
  return (
    <>
      <ContextMenu>
        <ContextMenuItem onClick={onSetAsStartTickClick}>
          <Trans context="Context menu">Set the tick of the bomb exploded as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb exploded minus X seconds as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb exploded plus X seconds as start tick</Trans>
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem onClick={onSetAsEndTickClick}>
          <Trans context="Context menu">Set the tick of the bomb exploded as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb exploded minus X seconds as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the bomb exploded plus X seconds as end tick</Trans>
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem onClick={onFocusCameraOnPlanterClick}>
          <Trans context="Context menu">Focus camera on planter</Trans>
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}

type TooltipProps = {
  bombExploded: BombExploded;
};

function TooltipContent({ bombExploded }: TooltipProps) {
  const { tick, site } = bombExploded;

  return (
    <div className="flex flex-col">
      <p>{<Trans>Tick: {tick}</Trans>}</p>
      <p>{<Trans>Bomb exploded on site {site}</Trans>}</p>
    </div>
  );
}

type Props = {
  bombExploded: BombExploded;
  iconSize: number;
};

export function BombExplodedItem({ iconSize, bombExploded }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <BombExplodedContextMenu bombExploded={bombExploded} />);
  };

  return (
    <Tooltip content={<TooltipContent bombExploded={bombExploded} />} placement="top" renderInPortal={true}>
      <div className="origin-left" style={scaleStyle} onContextMenu={onContextMenu}>
        <ExplosionIcon width={iconSize} height={iconSize} className="text-terro" />
      </div>
    </Tooltip>
  );
}
