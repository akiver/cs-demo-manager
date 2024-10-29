import React from 'react';
import { Trans } from '@lingui/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useGetTimeElapsedBetweenFrames } from 'csdm/ui/match/use-time-elapsed-between-frames';
import { Indicator } from 'csdm/ui/match/viewer-2d/playback-bar/indicator';
import { useViewerContext } from 'csdm/ui/match/viewer-2d/use-viewer-context';
import { useCurrentMatch } from '../../use-current-match';

type Props = {
  leftX: number;
};

export function FreezetimeEndIndicator({ leftX }: Props) {
  const { round } = useViewerContext();
  const match = useCurrentMatch();
  const getTimeElapsedBetweenFrames = useGetTimeElapsedBetweenFrames();
  const time = getTimeElapsedBetweenFrames({
    startFrame: round.startFrame,
    endFrame: round.freezetimeEndFrame,
    frameRate: match.frameRate,
  });

  return (
    <Tooltip content={<Trans>{time} Freeze time ended</Trans>} placement="top">
      <Indicator leftX={leftX} color="#12805c" />
    </Tooltip>
  );
}
