import React from 'react';
import { animated, useTransition } from '@react-spring/web';
import type { Kill } from 'csdm/common/types/kill';
import { useViewerContext } from './use-viewer-context';
import { useCurrentMatch } from '../use-current-match';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';

function getVisibleKills(kills: Kill[], currentFrame: number, framerate: number) {
  return kills
    .filter((kill) => {
      if (kill.frame <= currentFrame) {
        const secondsElapsed = (currentFrame - kill.frame) / framerate;
        return secondsElapsed < 5;
      }

      return false;
    })
    .sort((kill1, kill2) => {
      if (kill1.frame < kill2.frame) {
        return -1;
      }
      if (kill1.frame > kill2.frame) {
        return 1;
      }
      return 0;
    });
}

type KillEntryProps = {
  kill: Kill;
  visibleKills: Kill[];
};

function KillEntry({ kill, visibleKills }: KillEntryProps) {
  const isVisible = visibleKills.includes(kill);
  const transitions = useTransition(isVisible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 200,
    },
  });

  return transitions((styles, isVisible) => {
    if (!isVisible) {
      return null;
    }

    return (
      <animated.div className="flex items-center rounded p-8 bg-black/30 mb-4" style={styles}>
        <KillFeedEntry kill={kill} />
      </animated.div>
    );
  });
}

export function KillsFeed() {
  const match = useCurrentMatch();
  const { kills, currentFrame } = useViewerContext();
  const visibleKills = getVisibleKills(kills, currentFrame, match.frameRate);

  return (
    <div className="absolute right-16 top-32 flex flex-col">
      {kills.map((kill) => {
        return <KillEntry key={`${kill.victimSteamId}-${kill.frame}`} kill={kill} visibleKills={visibleKills} />;
      })}
    </div>
  );
}
