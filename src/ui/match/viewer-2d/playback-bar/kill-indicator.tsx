import React from 'react';
import { Tooltip } from 'csdm/ui/components/tooltip';
import type { Kill } from 'csdm/common/types/kill';
import { Indicator } from 'csdm/ui/match/viewer-2d/playback-bar/indicator';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import { useViewerContext } from 'csdm/ui/match/viewer-2d/use-viewer-context';
import { getTeamColor } from '../../../styles/get-team-color';
import { useCurrentMatch } from '../../use-current-match';

type Props = {
  leftX: number;
  kill: Kill;
};

export function KillIndicator({ kill, leftX }: Props) {
  const { round } = useViewerContext();
  const color = getTeamColor(kill.victimSide);
  const match = useCurrentMatch();

  return (
    <Tooltip
      content={
        <KillFeedEntry
          kill={kill}
          timeElapsedOption={{
            tickrate: match.tickrate,
            roundFreezetimeEndTick: round.freezetimeEndTick,
          }}
        />
      }
      placement="top"
    >
      <Indicator leftX={leftX} color={color} />
    </Tooltip>
  );
}
