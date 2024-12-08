import React, { type ReactNode } from 'react';
import { Plural, Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { SelectSecondsDialog } from './select-seconds-dialog';

type Pros = {
  startTick: number;
  eventTick: number;
  label: ReactNode;
  onSubmit: (tick: number) => void;
};

export function FocusCameraOnEventSubContextMenu({ label, startTick, eventTick, onSubmit }: Pros) {
  const { showDialog } = useDialog();
  const match = useCurrentMatch();
  const seconds = [1, 2, 3, 4, 5, 10];

  return (
    <SubContextMenu label={label}>
      <ContextMenuItem
        onClick={() => {
          onSubmit(startTick);
        }}
      >
        <Trans context="Context menu">At the start of the sequence</Trans>
      </ContextMenuItem>
      {seconds.map((second) => {
        return (
          <ContextMenuItem
            key={second}
            onClick={() => {
              onSubmit(eventTick - Math.round(second * match.tickrate));
            }}
          >
            <Plural value={second} one="# second before" other="# seconds before" />
          </ContextMenuItem>
        );
      })}
      <ContextMenuItem
        onClick={() => {
          showDialog(<SelectSecondsDialog tick={eventTick} operation="minus" onSubmit={onSubmit} />);
        }}
      >
        <Trans context="Context menu">X seconds before</Trans>
      </ContextMenuItem>
    </SubContextMenu>
  );
}
