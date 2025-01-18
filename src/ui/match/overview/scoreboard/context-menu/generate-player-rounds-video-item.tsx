import React from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { generatePlayerRoundsSequences } from 'csdm/ui/match/video/sequences/sequences-actions';
import { buildMatchVideoPath } from 'csdm/ui/routes-paths';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

type Props = {
  steamId: string;
};

export function GeneratePlayerRoundsVideoItem({ steamId }: Props) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const navigate = useNavigate();
  const { settings } = useVideoSettings();

  const onClick = () => {
    dispatch(
      generatePlayerRoundsSequences({
        match,
        steamId,
        settings,
      }),
    );
    navigate(buildMatchVideoPath(match.checksum));
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Rounds</Trans>
    </ContextMenuItem>
  );
}
