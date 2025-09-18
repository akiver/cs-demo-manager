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
    <div className="h-full overflow-hidden border-y border-gray-900 bg-gray-75" onContextMenu={onContextMenu}>
      <div className="absolute left-0 h-full w-px origin-left bg-gray-900" style={scaleStyle} />
      <div className="absolute right-0 h-full w-px origin-right bg-gray-900" style={scaleStyle} />
      <div className="origin-left pl-4 text-caption whitespace-nowrap" style={scaleStyle}>
        <p>{`#${round.number} - ${Math.round((round.endTick - round.startTick) / ticksPerSecond)}s`}</p>
        <p>{`${round.startTick}-${round.endTick}`}</p>
      </div>
    </div>
  );
}
