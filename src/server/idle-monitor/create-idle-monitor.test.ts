import { describe, it, expect, vi } from 'vite-plus/test';
import { createIdleMonitor, IDLE_CHECK_INTERVAL_MS, MAX_CONSECUTIVE_IDLE_CHECKS } from './create-idle-monitor';

describe('createIdleMonitor', () => {
  it('should call onIdle after consecutive idle checks', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    const monitor = createIdleMonitor(() => false, onIdle);
    monitor.start();

    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * (MAX_CONSECUTIVE_IDLE_CHECKS - 1));
    expect(onIdle).not.toHaveBeenCalled();

    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
    expect(onIdle).toHaveBeenCalledTimes(1);

    monitor.stop();
    vi.useRealTimers();
  });

  it('should not call onIdle while busy and reset the idle count on activity', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    let isBusy = true;
    const monitor = createIdleMonitor(() => isBusy, onIdle);
    monitor.start();

    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * MAX_CONSECUTIVE_IDLE_CHECKS * 2);
    expect(onIdle).not.toHaveBeenCalled();

    // Two idle checks then activity again: the count must reset.
    isBusy = false;
    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * (MAX_CONSECUTIVE_IDLE_CHECKS - 1));
    isBusy = true;
    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
    isBusy = false;
    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * (MAX_CONSECUTIVE_IDLE_CHECKS - 1));
    expect(onIdle).not.toHaveBeenCalled();

    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
    expect(onIdle).toHaveBeenCalledTimes(1);

    monitor.stop();
    vi.useRealTimers();
  });

  it('should not check anymore once stopped', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();
    const monitor = createIdleMonitor(() => false, onIdle);
    monitor.start();
    monitor.stop();

    vi.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * MAX_CONSECUTIVE_IDLE_CHECKS * 2);
    expect(onIdle).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
