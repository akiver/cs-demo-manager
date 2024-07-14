import React from 'react';
import { Trans } from '@lingui/macro';
import { EliminationIcon } from 'csdm/ui/icons/elimination-icon';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { Tooltip } from 'csdm/ui/components/tooltip';
import type { Kill } from 'csdm/common/types/kill';
import { SelectSecondsDialog } from './select-seconds-dialog';
import type { TickOperation, TickPosition } from './select-seconds-dialog';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useSequenceForm } from '../use-sequence-form';

type ContextMenuProps = {
  kill: Kill;
};

function KillContextMenu({ kill }: ContextMenuProps) {
  const { updateSequence } = useSequenceForm();
  const onSetAsStartTickClick = () => {
    updateSequence({
      startTick: String(kill.tick),
    });
  };
  const { showDialog } = useDialog();

  const showSelectSecondsDialog = (position: TickPosition, operation: TickOperation) => {
    showDialog(
      <SelectSecondsDialog
        tick={kill.tick}
        tickPosition={position}
        operation={operation}
        updateSequence={updateSequence}
      />,
    );
  };
  const onSetAsStartTickMinusSecondsClick = () => {
    showSelectSecondsDialog('start', 'minus');
  };
  const onSetAsStartTickPlusSecondsClick = () => {
    showSelectSecondsDialog('start', 'plus');
  };
  const onSetAsEndTickClick = () => {
    updateSequence({
      endTick: String(kill.tick),
    });
  };
  const onSetAsEndTickMinusSecondsClick = () => {
    showSelectSecondsDialog('end', 'minus');
  };
  const onSetAsEndTickPlusSecondsClick = () => {
    showSelectSecondsDialog('end', 'plus');
  };
  const onFocusCameraOnKillerClick = () => {
    updateSequence({
      playerFocusSteamId: kill.killerSteamId,
    });
  };
  const onFocusCameraOnVictimClick = () => {
    updateSequence({
      playerFocusSteamId: kill.victimSteamId,
    });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuItem onClick={onSetAsStartTickClick}>
          <Trans context="Context menu">Set the tick of the kill as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the kill minus X seconds as start tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsStartTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the kill plus X seconds as start tick</Trans>
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem onClick={onSetAsEndTickClick}>
          <Trans context="Context menu">Set the tick of the kill as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickMinusSecondsClick}>
          <Trans context="Context menu">Set the tick of the kill minus X seconds as end tick</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetAsEndTickPlusSecondsClick}>
          <Trans context="Context menu">Set the tick of the kill plus X seconds as end tick</Trans>
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem onClick={onFocusCameraOnKillerClick}>
          <Trans context="Context menu">Focus camera on killer</Trans>
        </ContextMenuItem>
        <ContextMenuItem onClick={onFocusCameraOnVictimClick}>
          <Trans context="Context menu">Focus camera on victim</Trans>
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}

type TooltipProps = {
  kill: Kill;
};

function TooltipContent({ kill }: TooltipProps) {
  const killerName = kill.killerName;
  const victimName = kill.victimName;
  const weaponName = kill.weaponName;
  return (
    <p>
      <Trans context="Tooltip">
        <span>{killerName}</span> killed
        <span>{victimName}</span> with
        <span>{weaponName}</span>
      </Trans>
    </p>
  );
}

type Props = {
  kill: Kill;
};

export function KillItem({ kill }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <KillContextMenu kill={kill} />);
  };

  return (
    <Tooltip content={<TooltipContent kill={kill} />} placement="top" renderInPortal={true}>
      <div style={scaleStyle} onContextMenu={onContextMenu}>
        <EliminationIcon className="fill-gray-900" width={20} height={20} />
      </div>
    </Tooltip>
  );
}
