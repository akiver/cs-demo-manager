import React from 'react';
import { Trans } from '@lingui/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Player } from 'csdm/common/types/player';
import { deleteSequence } from '../sequences-actions';

type ContextMenuProps = {
  sequence: Sequence;
  onEditClick: (sequence: Sequence) => void;
};

function SequenceContextMenu({ sequence, onEditClick }: ContextMenuProps) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const handleEditClick = () => {
    onEditClick(sequence);
  };
  const onDeleteClick = () => {
    dispatch(deleteSequence({ demoFilePath: match.demoFilePath, sequence }));
  };

  return (
    <ContextMenu>
      <ContextMenuItem onClick={handleEditClick}>
        <Trans context="Context menu">Edit</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onDeleteClick}>
        <Trans context="Context menu">Delete</Trans>
      </ContextMenuItem>
    </ContextMenu>
  );
}

type TooltipProps = {
  sequence: Sequence;
  durationInSeconds: number;
  focusPlayer: Player | undefined;
};

function TooltipContent({ sequence, durationInSeconds, focusPlayer }: TooltipProps) {
  return (
    <div>
      <p>{`Sequence #${sequence.number}`}</p>
      <p>{`Tick: ${sequence.startTick} to ${sequence.endTick}`}</p>
      <p>{`Duration ${durationInSeconds}s`}</p>
      {focusPlayer !== undefined && <p>{`Camera on ${focusPlayer.name}`}</p>}
    </div>
  );
}

type Props = {
  sequence: Sequence;
  players: Player[];
  ticksPerSecond: number;
  isOverlapping: boolean;
  onEditClick: (sequence: Sequence) => void;
};

export function SequenceItem({ sequence, players, ticksPerSecond, isOverlapping, onEditClick }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    showContextMenu(event.nativeEvent, <SequenceContextMenu sequence={sequence} onEditClick={onEditClick} />);
  };
  const durationInSeconds = Math.round((sequence.endTick - sequence.startTick) / ticksPerSecond);
  const focusPlayer = players.find((player) => player.steamId === sequence.playerFocusSteamId);

  return (
    <Tooltip
      content={<TooltipContent sequence={sequence} durationInSeconds={durationInSeconds} focusPlayer={focusPlayer} />}
      placement="top"
      renderInPortal={true}
    >
      <div
        className={`flex justify-center flex-col h-full border-y border-gray-700 w-full overflow-hidden ${
          isOverlapping ? 'text-white bg-red-700' : 'text-gray-900 bg-gray-75'
        }`}
        onContextMenu={onContextMenu}
      >
        <div className="absolute w-px bg-gray-900 left-0 h-full" style={scaleStyle} />
        <div className="absolute w-px bg-gray-900 right-0 h-full" style={scaleStyle} />
        <div className=" whitespace-nowrap origin-left" style={scaleStyle}>
          <p>{`#${sequence.number}`}</p>
          <p>{`${durationInSeconds}s`}</p>
          <p>{`${sequence.startTick}-${sequence.endTick}`}</p>
          {focusPlayer !== undefined && <p>{`Camera on ${focusPlayer.name}`}</p>}
        </div>
      </div>
    </Tooltip>
  );
}
