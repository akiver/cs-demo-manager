import { describe, expect, it, vi } from 'vite-plus/test';
import { resolveClusterPort } from './resolve-cluster-port';

const mocks = vi.hoisted(() => {
  return { socketDestroy: vi.fn() };
});

vi.mock('node:net', () => {
  return {
    default: {
      createServer: () => {
        let connectionListener: ((socket: { destroy: () => void }) => void) | undefined;
        let wasSocketDestroyed = false;
        return {
          unref: vi.fn(),
          once: vi.fn(),
          on: (event: string, listener: (socket: { destroy: () => void }) => void) => {
            if (event === 'connection') {
              connectionListener = listener;
            }
          },
          listen: (_options: unknown, listener: () => void) => {
            connectionListener?.({
              destroy: () => {
                wasSocketDestroyed = true;
                mocks.socketDestroy();
              },
            });
            listener();
          },
          address: () => ({ port: 54_321 }),
          close: (listener?: () => void) => {
            if (!wasSocketDestroyed) {
              throw new Error('close would wait for the accepted socket');
            }
            listener?.();
          },
        };
      },
    },
  };
});

describe('resolveClusterPort', () => {
  it('destroys a client accepted during the ephemeral-port probe before closing the server', async () => {
    await expect(resolveClusterPort(undefined)).resolves.toBe(54_321);
    expect(mocks.socketDestroy).toHaveBeenCalledOnce();
  });
});
