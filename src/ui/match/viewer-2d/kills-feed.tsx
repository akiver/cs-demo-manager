import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Kill } from 'csdm/common/types/kill';
import { useViewerContext } from './use-viewer-context';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';

function getVisibleKills(kills: Kill[], currentTick: number, tickrate: number) {
  return kills
    .filter((kill) => {
      if (kill.tick <= currentTick) {
        const secondsElapsed = (currentTick - kill.tick) / tickrate;
        return secondsElapsed < 5;
      }

      return false;
    })
    .sort((kill1, kill2) => {
      if (kill1.tick < kill2.tick) {
        return -1;
      }
      if (kill1.tick > kill2.tick) {
        return 1;
      }
      return 0;
    });
}

export function KillsFeed() {
  const { kills, currentTick, tickrate } = useViewerContext();
  const visibleKills = getVisibleKills(kills, currentTick, tickrate);

  return (
    <div className="absolute right-16 top-32 flex flex-col">
      <AnimatePresence>
        {visibleKills.map((kill) => {
          return (
            <motion.div
              key={kill.id}
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
