import React from 'react';
import { Trans } from '@lingui/react/macro';
import { generatePlayersKillsSequences } from 'csdm/ui/match/video/sequences/sequences-actions';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { GeneratePlayerEventsDialog } from './generate-player-events-dialog';

type Props = {
  steamId: string;
};

export function GeneratePlayerKillsVideoItem({ steamId }: Props) {
  const dispatch = useDispatch();
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(
      <GeneratePlayerEventsDialog
        steamId={steamId}
        secondsBeforeLabel={<Trans context="Input label">Seconds before each kill to start the sequence</Trans>}
        secondsAfterLabel={<Trans context="Input label">Seconds after each kill to stop the sequence</Trans>}
        generateSequences={(payload) => {
          dispatch(generatePlayersKillsSequences(payload));
        }}
      />,
    );
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Kills</Trans>
    </ContextMenuItem>
  );
}
