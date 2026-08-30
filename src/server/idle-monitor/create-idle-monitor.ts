export const IDLE_CHECK_INTERVAL_MS = 5_000;
// Number of consecutive idle checks before exiting, it also acts as a grace period covering the window between the
// daemon being spawned and its first client connecting.
export const MAX_CONSECUTIVE_IDLE_CHECKS = 3;

export type IdleMonitor = {
  start: () => void;
  stop: () => void;
};

export function createIdleMonitor(isBusy: () => boolean, onIdle: () => void): IdleMonitor {
  let intervalId: NodeJS.Timeout | null = null;
  let consecutiveIdleChecks = 0;

  return {
    start: () => {
      if (intervalId) {
        return;
      }

      intervalId = setInterval(() => {
        if (isBusy()) {
          consecutiveIdleChecks = 0;
          return;
        }

        consecutiveIdleChecks++;
        if (consecutiveIdleChecks >= MAX_CONSECUTIVE_IDLE_CHECKS) {
          onIdle();
        }
      }, IDLE_CHECK_INTERVAL_MS);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      consecutiveIdleChecks = 0;
    },
  };
}
