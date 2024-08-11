import React from 'react';
import { Trans } from '@lingui/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useGetTimeElapsedBetweenFrames } from 'csdm/ui/match/use-time-elapsed-between-frames';
import { Indicator } from 'csdm/ui/match/viewer-2d/playback-bar/indicator';
import { useViewerContext } from 'csdm/ui/match/viewer-2d/use-viewer-context';
import { useCurrentMatch } from '../../use-current-match';

type Props = {
  leftX: number;
  planterName: string;
  site: string;
  frame: number;
};

export function BombExplodedIndicator({ frame, leftX, planterName, site }: Props) {
  const { round } = useViewerContext();
  const match = useCurrentMatch();
  const getTimeElapsedBetweenFrames = useGetTimeElapsedBetweenFrames();

  return (
    <Tooltip
      content={
        <p className="w-max">
          <Trans>
            {getTimeElapsedBetweenFrames({
              startFrame: round.startFrame,
              endFrame: frame,
              frameRate: match.frameRate,
            })}{' '}
            Bomb planted by {planterName} exploded at site {site}
          </Trans>
        </p>
      }
      placement="top"
    >
      <Indicator leftX={leftX} color="#c9252d" />
    </Tooltip>
  );
}
