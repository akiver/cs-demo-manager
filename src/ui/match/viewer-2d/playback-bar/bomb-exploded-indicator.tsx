import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getTimeElapsedBetweenTicks } from 'csdm/ui/match/get-time-elapsed-between-ticks';
import { Indicator } from 'csdm/ui/match/viewer-2d/playback-bar/indicator';
import { useViewerContext } from 'csdm/ui/match/viewer-2d/use-viewer-context';

type Props = {
  leftX: number;
  planterName: string;
  site: string;
  tick: number;
};

export function BombExplodedIndicator({ tick, leftX, planterName, site }: Props) {
  const { round, tickrate } = useViewerContext();
  const time = getTimeElapsedBetweenTicks({
    tickrate,
    startTick: round.freezetimeEndTick,
    endTick: tick,
  });

  return (
    <Tooltip
      content={
        <p className="w-max">
          <Trans>
            {time} Bomb planted by {planterName} exploded at site {site}
          </Trans>
        </p>
      }
      placement="top"
    >
      <Indicator leftX={leftX} color="#c9252d" />
    </Tooltip>
  );
}
