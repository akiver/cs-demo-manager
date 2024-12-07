import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
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

export function KillsFeed() {
  const match = useCurrentMatch();
  const { kills, currentFrame } = useViewerContext();
  const visibleKills = getVisibleKills(kills, currentFrame, match.frameRate);

  return (
    <div className="absolute right-16 top-32 flex flex-col">
      <AnimatePresence>
        {visibleKills.map((kill) => {
          return (
            <motion.div
              key={`${kill.victimSteamId}-${kill.frame}`}
              className="flex items-center rounded p-8 bg-black/30 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0 }}
            >
              <KillFeedEntry kill={kill} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
