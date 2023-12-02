import React from 'react';
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

export function BombPlantedIndicator({ frame, leftX, planterName, site }: Props) {
  const { round } = useViewerContext();
  const match = useCurrentMatch();
  const getTimeElapsedBetweenFrames = useGetTimeElapsedBetweenFrames();
  const siteBlockWidth = 35;
  const center = siteBlockWidth / 2;

  return (
    <Tooltip
      content={`${getTimeElapsedBetweenFrames({
        startFrame: round.startFrame,
        endFrame: frame,
        frameRate: match.frameRate,
      })} Bomb planted by "${planterName}" at bomb site ${site}`}
      placement="top"
    >
      <div
        className="absolute flex items-center h-full"
        style={{
          left: leftX - center,
        }}
      >
        <div
          className="flex items-center justify-center h-24 rounded bg-[#c9252d] z-1"
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
