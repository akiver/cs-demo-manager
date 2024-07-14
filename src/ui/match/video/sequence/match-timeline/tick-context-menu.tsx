import React from 'react';
import { Trans } from '@lingui/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useSequenceForm } from '../use-sequence-form';

type Props = {
  tick: number;
};

export function TickContextMenu({ tick }: Props) {
  const { updateSequence } = useSequenceForm();
  const onStartClick = () => {
    updateSequence({
      startTick: String(tick),
    });
  };
  const onEndClick = () => {
    updateSequence({
      endTick: String(tick),
    });
  };

  return (
    <ContextMenu>
      <ContextMenuItem onClick={onStartClick}>
        <Trans context="Context menu">Set tick {tick} as start tick</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onEndClick}>
        <Trans context="Context menu">Set tick {tick} as end tick</Trans>
      </ContextMenuItem>
    </ContextMenu>
  );
}
