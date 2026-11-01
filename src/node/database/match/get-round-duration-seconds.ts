import { GameMode, RoundEndReason } from 'csdm/common/types/counter-strike';

type Round = {
  freezeTimeEndTick: number;
  endTick: number;
  endReason: RoundEndReason;
};

// How long the round clock runs once the freeze time ends, in seconds. The round time isn't in the demo, it is read
// from the rounds the clock ran out on: they ended exactly when it reached zero. Without such a round, it is the
// default of the game mode.
export function getRoundDurationSeconds(rounds: Round[], tickrate: number, gameMode: string): number {
  if (tickrate > 0) {
    for (const round of rounds) {
      const clockRanOut =
        round.endReason === RoundEndReason.TargetSaved || round.endReason === RoundEndReason.HostagesNotRescued;
      if (!clockRanOut || round.endTick <= round.freezeTimeEndTick) {
        continue;
      }

      const seconds = Math.round((round.endTick - round.freezeTimeEndTick) / tickrate);
      if (seconds > 0) {
        return seconds;
      }
    }
  }

  // mp_roundtime_defuse/mp_roundtime_hostage of the competitive modes, and mp_roundtime of wingman.
  const defaultRoundDurationSeconds = 115;
  const wingmanRoundDurationSeconds = 90;

  return gameMode === GameMode.Scrimmage2V2 ? wingmanRoundDurationSeconds : defaultRoundDurationSeconds;
}
