import React from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { generatePlayerKillsSequences } from 'csdm/ui/match/video/sequences/sequences-actions';
import { buildMatchVideoPath } from 'csdm/ui/routes-paths';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { SelectPovDialog } from 'csdm/ui/components/dialogs/select-pov-dialog';
import { Perspective } from 'csdm/common/types/perspective';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

type Props = {
  steamId: string;
};

export function GeneratePlayerKillsVideoItem({ steamId }: Props) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const { settings } = useVideoSettings();
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const generateSequences = (perspective: Perspective) => {
    dispatch(
      generatePlayerKillsSequences({
        match,
        steamId,
        perspective,
        weapons: [],
        settings,
      }),
    );
    setTimeout(() => {
      navigate(buildMatchVideoPath(match.checksum));
    }, 300);
  };

  const onClick = () => {
    showDialog(
      <SelectPovDialog
        onPlayerClick={() => {
          generateSequences(Perspective.Player);
        }}
        onEnemyClick={() => {
          generateSequences(Perspective.Enemy);
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
