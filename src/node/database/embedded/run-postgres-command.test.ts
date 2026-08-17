import { describe, expect, it, vi } from 'vite-plus/test';
import { runPostgresCommand } from './run-postgres-command';

const mocks = vi.hoisted(() => {
  return { execFile: vi.fn() };
});

vi.mock('node:child_process', () => {
  return { execFile: mocks.execFile };
});
vi.mock('./postgres-binaries', () => {
  return { buildPostgresEnv: () => ({}) };
});

describe('runPostgresCommand', () => {
  it.each([0, -1])('rejects a non-positive timeout (%s)', async (timeoutMs) => {
    await expect(runPostgresCommand('postgres', [], { timeoutMs })).rejects.toThrow(
      'PostgreSQL command timeout must be greater than zero',
    );
    expect(mocks.execFile).not.toHaveBeenCalled();
  });

  it('preserves the original command error as the cause', async () => {
    const commandError = new Error('spawn failed');
    mocks.execFile.mockImplementationOnce((_binary, _args, _options, callback) => {
      callback(commandError, '', 'postgres details');
    });

    try {
      await runPostgresCommand('postgres', []);
      expect.unreachable('the command should reject');
    } catch (error) {
      expect(error).toMatchObject({
        message: 'spawn failed\npostgres details',
        cause: commandError,
      });
      expect(commandError.message).toBe('spawn failed');
    }
  });
});
