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

export function BombPlantedIndicator({ tick, leftX, planterName, site }: Props) {
  const { round, tickrate } = useViewerContext();
  const siteBlockWidth = 35;
  const center = siteBlockWidth / 2;
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
            {time} Bomb planted by {planterName} at bomb site {site}
          </Trans>
        </p>
      }
      placement="top"
    >
      <div
        className="absolute flex h-full items-center"
        style={{
          left: leftX - center,
        }}
      >
        <div
          className="z-1 flex h-24 items-center justify-center rounded bg-[#c9252d]"
          style={{
            width: siteBlockWidth,
          }}
        >
          <p className="text-body-strong text-gray-50">{site}</p>
        </div>
        <Indicator leftX={center} color="#c9252d" />
      </div>
    </Tooltip>
  );
}
