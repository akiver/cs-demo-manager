import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { isVideoGenerationAvailable } from 'csdm/ui/hooks/use-counter-strike';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { addSequence } from 'csdm/ui/match/video/sequences/sequences-actions';
import { useCurrentMatchSequences } from 'csdm/ui/match/video/sequences/use-current-match-sequences';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

type Props = {
  startTick: number;
  endTick: number;
  playerFocusSteamId: string;
  playerFocusName: string;
};

export function AddToVideoSequencesItem({ startTick, endTick, playerFocusSteamId, playerFocusName }: Props) {
  const { settings } = useVideoSettings();
  const match = useCurrentMatch();
  const dispatch = useDispatch();
  const sequences = useCurrentMatchSequences();

  if (!isVideoGenerationAvailable(match.game)) {
    return null;
  }

  const onClick = () => {
    dispatch(
      addSequence({
        demoFilePath: match.demoFilePath,
        sequence: {
          startTick,
          endTick,
          number: sequences.length + 1,
          showOnlyDeathNotices: settings.showOnlyDeathNotices,
          deathNoticesDuration: settings.deathNoticesDuration,
          playersOptions: [],
          cameras: [
            {
              tick: startTick,
              playerSteamId: playerFocusSteamId,
              playerName: playerFocusName,
            },
          ],
          showXRay: false,
          playerVoicesEnabled: false,
        },
      }),
    );
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Add to video sequences</Trans>
    </ContextMenuItem>
  );
}
