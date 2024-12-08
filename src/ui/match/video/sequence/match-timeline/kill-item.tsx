import React from 'react';
import { Trans } from '@lingui/react/macro';
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
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import { Tick } from './tick';
import { FocusCameraOnEventSubContextMenu } from './focus-camera-on-event-sub-context-menu';

type ContextMenuProps = {
  kill: Kill;
};

function KillContextMenu({ kill }: ContextMenuProps) {
  const { sequence, setCameraOnPlayerAtTick, setStartTick, setEndTick } = useSequenceForm();
  const { showDialog } = useDialog();

  const onSetAsStartTickClick = () => {
    setStartTick(kill.tick);
  };

  const showSelectSequenceBoundarySecondsDialog = (position: TickPosition, operation: TickOperation) => {
    showDialog(
      <SelectSecondsDialog
        tick={kill.tick}
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
  const onSetAsStartTickMinusSecondsClick = () => {
    showSelectSequenceBoundarySecondsDialog('start', 'minus');
  };
  const onSetAsStartTickPlusSecondsClick = () => {
    showSelectSequenceBoundarySecondsDialog('start', 'plus');
  };
  const onSetAsEndTickClick = () => {
    setEndTick(kill.tick);
  };
  const onSetAsEndTickMinusSecondsClick = () => {
    showSelectSequenceBoundarySecondsDialog('end', 'minus');
  };
  const onSetAsEndTickPlusSecondsClick = () => {
    showSelectSequenceBoundarySecondsDialog('end', 'plus');
  };

  return (
    <>
      <ContextMenu>
        <FocusCameraOnEventSubContextMenu
          eventTick={kill.tick}
          startTick={Number(sequence.startTick)}
          label={<Trans context="Context menu">Focus camera on killer</Trans>}
          onSubmit={(tick) => {
            setCameraOnPlayerAtTick({
              tick,
              playerSteamId: kill.killerSteamId,
            });
          }}
        />
        <FocusCameraOnEventSubContextMenu
          eventTick={kill.tick}
          startTick={Number(sequence.startTick)}
          label={<Trans context="Context menu">Focus camera on victim</Trans>}
          onSubmit={(tick) => {
            setCameraOnPlayerAtTick({
              tick,
              playerSteamId: kill.victimSteamId,
            });
          }}
        />
        <Separator />
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
      </ContextMenu>
    </>
  );
}

type TooltipProps = {
  kill: Kill;
};

function TooltipContent({ kill }: TooltipProps) {
  return (
    <div className="flex flex-col">
      <Tick tick={kill.tick} />
      <KillFeedEntry kill={kill} />
    </div>
  );
}

type Props = {
  kill: Kill;
  iconSize: number;
};

export function KillItem({ kill, iconSize }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <KillContextMenu kill={kill} />);
  };

  return (
    <Tooltip content={<TooltipContent kill={kill} />} placement="top" renderInPortal={true}>
      <div style={scaleStyle} onContextMenu={onContextMenu}>
        <EliminationIcon className="fill-gray-900" width={iconSize} height={iconSize} />
      </div>
    </Tooltip>
  );
}
