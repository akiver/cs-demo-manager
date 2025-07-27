import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getTimeElapsedBetweenTicks } from 'csdm/ui/match/get-time-elapsed-between-ticks';
import { Indicator } from 'csdm/ui/match/viewer-2d/playback-bar/indicator';
import { useViewerContext } from 'csdm/ui/match/viewer-2d/use-viewer-context';

type Props = {
  leftX: number;
};

export function FreezetimeEndIndicator({ leftX }: Props) {
  const { round, tickrate } = useViewerContext();
  const time = getTimeElapsedBetweenTicks({
    tickrate: tickrate,
    startTick: round.startTick,
    endTick: round.freezetimeEndTick,
  });

  return (
    <Tooltip content={<Trans>{time} Freeze time ended</Trans>} placement="top">
      <Indicator leftX={leftX} color="#12805c" />
    </Tooltip>
  );
}
