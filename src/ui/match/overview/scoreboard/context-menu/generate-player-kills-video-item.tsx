import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { generatePlayerKillsSequences } from 'csdm/ui/match/video/sequences/sequences-actions';
import { buildMatchVideoPath } from 'csdm/ui/routes-paths';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  steamId: string;
};

export function GeneratePlayerKillsVideoItem({ steamId }: Props) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const navigate = useNavigate();

  const onClick = () => {
    dispatch(
      generatePlayerKillsSequences({
        match,
        steamId,
      }),
    );
    navigate(buildMatchVideoPath(match.checksum));
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Generate kills video</Trans>
    </ContextMenuItem>
  );
}
