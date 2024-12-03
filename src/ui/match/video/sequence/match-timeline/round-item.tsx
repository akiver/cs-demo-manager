import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import type { Round } from 'csdm/common/types/round';
import { useSequenceForm } from '../use-sequence-form';

type ContextMenuProps = {
  round: Round;
};

function RoundContextMenu({ round }: ContextMenuProps) {
  const { updateSequence } = useSequenceForm();
  const onSetRoundStartTickAsStartClick = () => {
    updateSequence({
      startTick: String(round.startTick),
    });
  };
  const onSetRoundStartTickAsEndClick = () => {
    updateSequence({
      endTick: String(round.startTick),
    });
  };
  const onSetRoundEndTickAsStartClick = () => {
    updateSequence({
      startTick: String(round.endTick),
    });
  };
  const onSetRoundEndTickAsEndClick = () => {
    updateSequence({
      endTick: String(round.endTick),
    });
  };
  return (
    <ContextMenu>
      <ContextMenuItem onClick={onSetRoundStartTickAsStartClick}>
        <Trans context="Context menu">Set round start tick as start tick</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onSetRoundStartTickAsEndClick}>
        <Trans context="Context menu">Set round start tick as end tick</Trans>
      </ContextMenuItem>
      <Separator />
      <ContextMenuItem onClick={onSetRoundEndTickAsStartClick}>
        <Trans context="Context menu">Set round end tick as start tick</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onSetRoundEndTickAsEndClick}>
        <Trans context="Context menu">Set round end tick as end tick</Trans>
      </ContextMenuItem>
    </ContextMenu>
  );
}

type Props = {
  round: Round;
  ticksPerSecond: number;
};

export function RoundItem({ round, ticksPerSecond }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <RoundContextMenu round={round} />);
  };

  return (
    <div
      className="flex justify-center flex-col h-full bg-gray-75 border-y border-gray-900 overflow-hidden"
      onContextMenu={onContextMenu}
    >
      <div className="absolute w-px bg-gray-900 left-0 h-full" style={scaleStyle} />
      <div className="absolute w-px bg-gray-900 right-0 h-full" style={scaleStyle} />
      <div className="whitespace-nowrap text-caption origin-left pl-4" style={scaleStyle}>
        <p>{`#${round.number} - ${Math.round((round.endTick - round.startTick) / ticksPerSecond)}s`}</p>
        <p>{`${round.startTick}-${round.endTick}`}</p>
      </div>
    </div>
  );
}
