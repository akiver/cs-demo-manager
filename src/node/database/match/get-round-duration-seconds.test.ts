import { describe, expect, it } from 'vite-plus/test';
import { GameMode, RoundEndReason } from 'csdm/common/types/counter-strike';
import { getRoundDurationSeconds } from './get-round-duration-seconds';

describe('getRoundDurationSeconds', () => {
  it('reads the duration from a round the clock ran out on', () => {
    const rounds = [
      { freezeTimeEndTick: 1000, endTick: 3000, endReason: RoundEndReason.CtWin },
      // 115.02 seconds at 64 ticks per second.
      { freezeTimeEndTick: 10000, endTick: 17361, endReason: RoundEndReason.TargetSaved },
    ];

    expect(getRoundDurationSeconds(rounds, 64, GameMode.Competitive)).toBe(115);
  });

  it('reads the duration from a hostage round the clock ran out on', () => {
    const rounds = [
      { freezeTimeEndTick: 1000, endTick: 3000, endReason: RoundEndReason.TerroristWin },
      // 150 seconds at 64 ticks per second.
      { freezeTimeEndTick: 2000, endTick: 11600, endReason: RoundEndReason.HostagesNotRescued },
    ];

    expect(getRoundDurationSeconds(rounds, 64, GameMode.Competitive)).toBe(150);
  });

  it('skips a round that ended before its freeze time ended', () => {
    const rounds = [{ freezeTimeEndTick: 1000, endTick: 500, endReason: RoundEndReason.TargetSaved }];

    expect(getRoundDurationSeconds(rounds, 64, GameMode.Competitive)).toBe(115);
  });

  it('falls back to the duration of the game mode', () => {
    const rounds = [{ freezeTimeEndTick: 1000, endTick: 3000, endReason: RoundEndReason.CtWin }];

    expect(getRoundDurationSeconds(rounds, 64, GameMode.Competitive)).toBe(115);
    expect(getRoundDurationSeconds(rounds, 64, GameMode.Premier)).toBe(115);
    expect(getRoundDurationSeconds(rounds, 64, GameMode.Scrimmage2V2)).toBe(90);
    expect(getRoundDurationSeconds([], 0, GameMode.Casual)).toBe(115);
  });
});
