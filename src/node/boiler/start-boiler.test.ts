import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { startBoiler } from './start-boiler';

const mocks = vi.hoisted(() => {
  return {
    assertSteamIsRunning: vi.fn(),
    execFile: vi.fn(),
    killCounterStrikeProcesses: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('node:child_process', () => {
  return { execFile: mocks.execFile };
});
vi.mock('csdm/node/counter-strike/launcher/assert-steam-is-running', () => {
  return { assertSteamIsRunning: mocks.assertSteamIsRunning };
});
vi.mock('csdm/node/counter-strike/kill-counter-strike-processes', () => {
  return { killCounterStrikeProcesses: mocks.killCounterStrikeProcesses };
});
vi.mock('csdm/node/filesystem/get-app-folder-path', () => {
  return { getAppFolderPath: () => 'app' };
});
vi.mock('csdm/node/filesystem/get-static-folder-path', () => {
  return { getStaticFolderPath: () => 'static' };
});

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
  vi.mocked(logger.error).mockReset();
});

describe('startBoiler', () => {
  it.each(['exit-first', 'error-first'])('settles as an abort when process events race (%s)', async (eventOrder) => {
    const child = new EventEmitter() as EventEmitter & { stdout: EventEmitter };
    child.stdout = new EventEmitter();
    mocks.execFile.mockReturnValueOnce(child);
    mocks.killCounterStrikeProcesses.mockResolvedValue(undefined);
    const abortReason = new Error('shutdown');
    abortReason.name = 'AbortError';
    const signal = AbortSignal.abort(abortReason);
    const onExit = vi.fn();

    const result = startBoiler({ signal, onExit });
    await vi.waitFor(() => expect(mocks.execFile).toHaveBeenCalledOnce());
    const settled = result.then(
      () => undefined,
      (error: unknown) => error,
    );
    const emitExit = () => child.listeners('exit')[0](1);
    const emitError = () => child.listeners('error')[0](abortReason);
    if (eventOrder === 'exit-first') {
      emitExit();
      emitError();
    } else {
      emitError();
      emitExit();
    }

    expect(await settled).toBe(abortReason);
    expect(onExit).not.toHaveBeenCalled();
    expect(mocks.killCounterStrikeProcesses).toHaveBeenCalledTimes(2);
    expect(logger.error).not.toHaveBeenCalled();
  });
});
