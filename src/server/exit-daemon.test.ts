import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';

const mocks = vi.hoisted(() => {
  return {
    destroyDatabaseConnection: vi.fn(),
    stopEmbeddedPostgreSql: vi.fn(),
    deleteDaemonInfoFile: vi.fn(),
    stopBackgroundTasks: vi.fn(),
    closeServer: vi.fn(),
  };
});

vi.mock('csdm/node/database/database', () => {
  return { destroyDatabaseConnection: mocks.destroyDatabaseConnection };
});
vi.mock('csdm/node/database/embedded/embedded-postgresql', () => {
  return { stopEmbeddedPostgreSql: mocks.stopEmbeddedPostgreSql };
});
vi.mock('csdm/node/daemon/daemon-info-file', () => {
  return { deleteDaemonInfoFile: mocks.deleteDaemonInfoFile };
});
vi.mock('csdm/server/start-background-tasks', () => {
  return { stopBackgroundTasks: mocks.stopBackgroundTasks };
});
vi.mock('csdm/server/server', () => {
  return { server: { close: mocks.closeServer } };
});

const logger = {
  debug: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  getLogFilePath: () => '/tmp/csdm.log',
};
vi.stubGlobal('logger', logger);

// The module keeps the pending exit in its state, each test needs a fresh instance.
async function importExitDaemon() {
  vi.resetModules();

  return import('./exit-daemon');
}

describe('exitDaemon', () => {
  let exit: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    for (const mock of Object.values(mocks)) {
      mock.mockReset();
      mock.mockResolvedValue(undefined);
    }
    logger.error.mockReset();
    exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    exit.mockRestore();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should release the daemon resources in order then exit with the given code', async () => {
    const { exitDaemon, isDaemonExiting } = await importExitDaemon();
    expect(isDaemonExiting()).toBe(false);

    await exitDaemon(3);

    expect(mocks.stopBackgroundTasks).toHaveBeenCalledTimes(1);
    expect(mocks.deleteDaemonInfoFile).toHaveBeenCalledWith(process.pid);
    expect(mocks.closeServer).toHaveBeenCalledTimes(1);
    expect(mocks.destroyDatabaseConnection).toHaveBeenCalledTimes(1);
    expect(mocks.stopEmbeddedPostgreSql).toHaveBeenCalledTimes(1);
    // The discovery file and the port must be released before the slow steps, see the comment in exitDaemon().
    const callOrder = [
      mocks.deleteDaemonInfoFile,
      mocks.closeServer,
      mocks.destroyDatabaseConnection,
      mocks.stopEmbeddedPostgreSql,
    ].map((mock) => mock.mock.invocationCallOrder[0]);
    expect(callOrder).toEqual(callOrder.toSorted((a, b) => a - b));
    expect(exit).toHaveBeenCalledWith(3);
    expect(isDaemonExiting()).toBe(true);
  });

  it('should return the pending exit when called again', async () => {
    const { exitDaemon, isDaemonExiting } = await importExitDaemon();
    const destroy = Promise.withResolvers<void>();
    mocks.destroyDatabaseConnection.mockReturnValue(destroy.promise);

    const firstExit = exitDaemon();
    const secondExit = exitDaemon();

    expect(secondExit).toBe(firstExit);
    expect(isDaemonExiting()).toBe(true);
    destroy.resolve();
    await firstExit;

    expect(mocks.deleteDaemonInfoFile).toHaveBeenCalledTimes(1);
    expect(mocks.destroyDatabaseConnection).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('should still exit when releasing a resource fails', async () => {
    const { exitDaemon } = await importExitDaemon();
    mocks.closeServer.mockRejectedValue(new Error('close failed'));
    mocks.destroyDatabaseConnection.mockRejectedValue(new Error('destroy failed'));
    mocks.stopEmbeddedPostgreSql.mockRejectedValue(new Error('stop failed'));

    await exitDaemon();

    expect(mocks.stopEmbeddedPostgreSql).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Error while closing the WebSocket server before exiting');
    expect(logger.error).toHaveBeenCalledWith('Error while closing the database connection before exiting');
    expect(logger.error).toHaveBeenCalledWith('Error while stopping the embedded database server before exiting');
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('should force the exit when releasing the resources takes longer than the deadline', async () => {
    const { exitDaemon } = await importExitDaemon();
    // A checked-out database client that is never released keeps the pool from closing.
    mocks.destroyDatabaseConnection.mockReturnValue(new Promise<void>(() => {}));

    void exitDaemon();
    // Let the exit reach the step that hangs.
    await vi.advanceTimersByTimeAsync(0);
    expect(mocks.destroyDatabaseConnection).toHaveBeenCalledTimes(1);
    expect(exit).not.toHaveBeenCalled();

    // The only pending timer is the deadline.
    await vi.advanceTimersToNextTimerAsync();

    expect(exit).toHaveBeenCalledWith(1);
    expect(mocks.stopEmbeddedPostgreSql).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.stringMatching(/^The daemon did not exit within \d+ms/));
  });
});
