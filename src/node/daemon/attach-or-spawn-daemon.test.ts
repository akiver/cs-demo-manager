import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import { attachOrSpawnDaemon } from './attach-or-spawn-daemon';
import { readDaemonInfoFile, deleteDaemonInfoFile } from './daemon-info-file';
import { probeDaemon, askDaemonToShutdown } from './probe-daemon';
import { spawn } from 'node:child_process';
import pkg from '../../../package.json';
import { isProcessAlive } from '../os/is-process-alive';

vi.mock('./daemon-info-file', () => {
  return {
    readDaemonInfoFile: vi.fn(),
    deleteDaemonInfoFile: vi.fn(),
    getDaemonInfoFilePath: () => '/tmp/daemon.json',
  };
});
vi.mock('../os/is-process-alive', () => {
  return {
    isProcessAlive: vi.fn(),
  };
});
vi.mock('./probe-daemon', () => {
  return {
    probeDaemon: vi.fn(),
    askDaemonToShutdown: vi.fn(),
  };
});
vi.mock('node:child_process', () => {
  return {
    spawn: vi.fn(() => {
      return { on: vi.fn(), unref: vi.fn() };
    }),
  };
});

vi.stubGlobal('logger', {
  debug: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  getLogFilePath: () => '/tmp/csdm.log',
});

const options = {
  serverBundlePath: '/app/server.js',
  execPath: '/app/electron',
  runAsNode: true,
};

const daemonInfo = { port: 4574, pid: 1234, version: pkg.version };
const healthyStatus = { version: pkg.version, busy: false, clientCount: 0, isDev: false };

describe('attachOrSpawnDaemon', () => {
  beforeEach(() => {
    vi.mocked(readDaemonInfoFile).mockReset();
    vi.mocked(deleteDaemonInfoFile).mockReset();
    vi.mocked(isProcessAlive).mockReset();
    vi.mocked(probeDaemon).mockReset();
    vi.mocked(askDaemonToShutdown).mockReset();
    vi.mocked(spawn).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should attach to a healthy running daemon without spawning', async () => {
    vi.mocked(readDaemonInfoFile).mockResolvedValue(daemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValue(healthyStatus);

    const port = await attachOrSpawnDaemon(options);

    expect(port).toBe(4574);
    expect(spawn).not.toHaveBeenCalled();
  });

  it('should delete a stale file and spawn when the pid is dead', async () => {
    const newDaemonInfo = { port: 4575, pid: 5678, version: pkg.version };
    vi.mocked(readDaemonInfoFile).mockResolvedValueOnce(daemonInfo).mockResolvedValue(newDaemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(false);
    vi.mocked(probeDaemon).mockResolvedValue(healthyStatus);

    const port = await attachOrSpawnDaemon(options);

    expect(deleteDaemonInfoFile).toHaveBeenCalledWith(daemonInfo.pid);
    expect(spawn).toHaveBeenCalledWith(
      options.execPath,
      [options.serverBundlePath],
      expect.objectContaining({
        detached: true,
        stdio: 'ignore',
      }),
    );
    expect(port).toBe(4575);
  });

  it('should delete a stale file and spawn when the probe does not answer', async () => {
    const newDaemonInfo = { port: 4576, pid: 5678, version: pkg.version };
    vi.mocked(readDaemonInfoFile).mockResolvedValueOnce(daemonInfo).mockResolvedValue(newDaemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValueOnce(null).mockResolvedValue(healthyStatus);

    const port = await attachOrSpawnDaemon(options);

    expect(deleteDaemonInfoFile).toHaveBeenCalledWith(daemonInfo.pid);
    expect(spawn).toHaveBeenCalled();
    expect(port).toBe(4576);
  });

  it('should spawn when there is no daemon info file', async () => {
    const newDaemonInfo = { port: 4577, pid: 5678, version: pkg.version };
    vi.mocked(readDaemonInfoFile).mockResolvedValueOnce(null).mockResolvedValue(newDaemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValue(healthyStatus);

    const port = await attachOrSpawnDaemon(options);

    expect(spawn).toHaveBeenCalled();
    expect(port).toBe(4577);
  });

  it('should replace an idle daemon running an outdated version', async () => {
    const outdatedStatus = { version: '0.0.1', busy: false, clientCount: 0, isDev: false };
    const newDaemonInfo = { port: 4578, pid: 5678, version: pkg.version };
    vi.mocked(readDaemonInfoFile).mockResolvedValueOnce(daemonInfo).mockResolvedValue(newDaemonInfo);
    // Alive during the attach check, dead after the shutdown request.
    vi.mocked(isProcessAlive).mockReturnValueOnce(true).mockReturnValue(false);
    vi.mocked(probeDaemon).mockResolvedValueOnce(outdatedStatus).mockResolvedValue(healthyStatus);
    vi.mocked(askDaemonToShutdown).mockResolvedValue(true);

    const port = await attachOrSpawnDaemon(options);

    expect(askDaemonToShutdown).toHaveBeenCalledWith(4574);
    expect(spawn).toHaveBeenCalled();
    expect(port).toBe(4578);
  });

  it('should wait for an outdated daemon that takes several seconds to exit', async () => {
    vi.useFakeTimers();
    const outdatedStatus = { version: '0.0.1', busy: false, clientCount: 0, isDev: false };
    const newDaemonInfo = { port: 4579, pid: 5678, version: pkg.version };
    vi.mocked(readDaemonInfoFile).mockResolvedValueOnce(daemonInfo).mockResolvedValue(newDaemonInfo);
    // The daemon stops its embedded database server before exiting, it stays alive for 10 seconds.
    const shutdownRequestedAt = Date.now();
    vi.mocked(isProcessAlive).mockImplementation(() => Date.now() - shutdownRequestedAt < 10_000);
    vi.mocked(probeDaemon).mockResolvedValueOnce(outdatedStatus).mockResolvedValue(healthyStatus);
    vi.mocked(askDaemonToShutdown).mockResolvedValue(true);

    const promise = attachOrSpawnDaemon(options);
    await vi.advanceTimersByTimeAsync(11_000);
    const port = await promise;

    expect(spawn).toHaveBeenCalled();
    expect(port).toBe(4579);
  });

  it('should fail when an outdated daemon is still alive after the shutdown timeout', async () => {
    vi.useFakeTimers();
    vi.mocked(readDaemonInfoFile).mockResolvedValue(daemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValue({ version: '0.0.1', busy: false, clientCount: 0, isDev: false });
    vi.mocked(askDaemonToShutdown).mockResolvedValue(true);

    const promise = attachOrSpawnDaemon(options);
    // Attach the rejection handler before advancing the timers, the rejection would otherwise be unhandled.
    const assertion = expect(promise).rejects.toThrow('is still alive 40s after accepting to exit');
    await vi.advanceTimersByTimeAsync(41_000);
    await assertion;

    // The daemon already released its port: neither attach to it nor spawn one that would race it on the data folder.
    expect(spawn).not.toHaveBeenCalled();
  });

  it('should attach without waiting when the outdated daemon refuses to exit', async () => {
    vi.mocked(readDaemonInfoFile).mockResolvedValue(daemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValue({ version: '0.0.1', busy: false, clientCount: 0, isDev: false });
    vi.mocked(askDaemonToShutdown).mockResolvedValue(false);

    const port = await attachOrSpawnDaemon(options);

    expect(askDaemonToShutdown).toHaveBeenCalledWith(4574);
    // The liveness check that precedes the probe is the only one.
    expect(isProcessAlive).toHaveBeenCalledTimes(1);
    expect(spawn).not.toHaveBeenCalled();
    expect(port).toBe(4574);
  });

  it('should attach to a busy daemon running an outdated version', async () => {
    vi.mocked(readDaemonInfoFile).mockResolvedValue(daemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValue({ version: '0.0.1', busy: true, clientCount: 0, isDev: false });

    const port = await attachOrSpawnDaemon(options);

    expect(askDaemonToShutdown).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
    expect(port).toBe(4574);
  });

  it('should attach to an idle daemon running an outdated version when clients are connected', async () => {
    vi.mocked(readDaemonInfoFile).mockResolvedValue(daemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValue({ version: '0.0.1', busy: false, clientCount: 1, isDev: false });

    const port = await attachOrSpawnDaemon(options);

    expect(askDaemonToShutdown).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
    expect(port).toBe(4574);
  });
});
