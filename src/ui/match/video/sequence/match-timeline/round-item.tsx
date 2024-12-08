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
  const { setStartTick, setEndTick } = useSequenceForm();

  return (
    <ContextMenu>
      <ContextMenuItem
        onClick={() => {
          setStartTick(round.startTick);
        }}
      >
        <Trans context="Context menu">Set round start tick as start tick</Trans>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => {
          setEndTick(round.startTick);
        }}
      >
        <Trans context="Context menu">Set round start tick as end tick</Trans>
      </ContextMenuItem>
      <Separator />
      <ContextMenuItem
        onClick={() => {
          setStartTick(round.endTick);
        }}
      >
        <Trans context="Context menu">Set round end tick as start tick</Trans>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => {
          setEndTick(round.endTick);
        }}
      >
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
    <div className="bg-gray-75 border-y border-gray-900 h-full overflow-hidden" onContextMenu={onContextMenu}>
      <div className="absolute w-px bg-gray-900 left-0 h-full origin-left" style={scaleStyle} />
      <div className="absolute w-px bg-gray-900 right-0 h-full origin-right" style={scaleStyle} />
      <div className="whitespace-nowrap text-caption pl-4 origin-left" style={scaleStyle}>
        <p>{`#${round.number} - ${Math.round((round.endTick - round.startTick) / ticksPerSecond)}s`}</p>
        <p>{`${round.startTick}-${round.endTick}`}</p>
      </div>
    </div>
  );
}
