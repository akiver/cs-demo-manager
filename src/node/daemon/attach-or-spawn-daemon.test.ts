import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
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
      return { unref: vi.fn() };
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
const healthyStatus = { version: pkg.version, busy: false };

describe('attachOrSpawnDaemon', () => {
  beforeEach(() => {
    vi.mocked(readDaemonInfoFile).mockReset();
    vi.mocked(deleteDaemonInfoFile).mockReset();
    vi.mocked(isProcessAlive).mockReset();
    vi.mocked(probeDaemon).mockReset();
    vi.mocked(askDaemonToShutdown).mockReset();
    vi.mocked(spawn).mockClear();
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

    expect(deleteDaemonInfoFile).toHaveBeenCalled();
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

    expect(deleteDaemonInfoFile).toHaveBeenCalled();
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
    const outdatedStatus = { version: '0.0.1', busy: false };
    const newDaemonInfo = { port: 4578, pid: 5678, version: pkg.version };
    vi.mocked(readDaemonInfoFile).mockResolvedValueOnce(daemonInfo).mockResolvedValue(newDaemonInfo);
    // Alive during the attach check, dead after the shutdown request.
    vi.mocked(isProcessAlive).mockReturnValueOnce(true).mockReturnValue(false);
    vi.mocked(probeDaemon).mockResolvedValueOnce(outdatedStatus).mockResolvedValue(healthyStatus);

    const port = await attachOrSpawnDaemon(options);

    expect(askDaemonToShutdown).toHaveBeenCalledWith(4574);
    expect(spawn).toHaveBeenCalled();
    expect(port).toBe(4578);
  });

  it('should attach to a busy daemon running an outdated version', async () => {
    vi.mocked(readDaemonInfoFile).mockResolvedValue(daemonInfo);
    vi.mocked(isProcessAlive).mockReturnValue(true);
    vi.mocked(probeDaemon).mockResolvedValue({ version: '0.0.1', busy: true });

    const port = await attachOrSpawnDaemon(options);

    expect(askDaemonToShutdown).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
    expect(port).toBe(4574);
  });
});
