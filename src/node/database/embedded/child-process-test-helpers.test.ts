import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vite-plus/test';
import { waitForChildOutput } from './child-process-test-helpers';

describe('waitForChildOutput', () => {
  it('rejects with diagnostics when the child exits before producing the expected output', async () => {
    const child = spawn(process.execPath, ['-e', "process.stderr.write('lock failed'); process.exit(7)"], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    await expect(waitForChildOutput(child, 'locked')).rejects.toThrow(/code=7.*lock failed/s);
  });

  it('accumulates stdout chunks until the expected output is complete', async () => {
    const child = spawn(
      process.execPath,
      ['-e', "process.stdout.write('loc'); setTimeout(() => process.stdout.write('ked'), 10)"],
      { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
    );

    await expect(waitForChildOutput(child, 'locked')).resolves.toBeUndefined();
  });
});
