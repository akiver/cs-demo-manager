import type { ChildProcess } from 'node:child_process';

export function waitForChildOutput(child: ChildProcess, expectedOutput: string) {
  return new Promise<void>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let isSettled = false;

    const cleanup = () => {
      child.off('error', onError);
      child.off('close', onClose);
      child.stdout?.off('data', onStdout);
      child.stderr?.off('data', onStderr);
    };
    const settle = (callback: () => void) => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      cleanup();
      callback();
    };
    const onError = (error: Error) => settle(() => reject(error));
    const onClose = (code: number | null, signal: NodeJS.Signals | null) => {
      settle(() => {
        reject(
          new Error(
            `Child process exited before printing ${JSON.stringify(expectedOutput)} (code=${code}, signal=${signal})\nstdout:\n${stdout}\nstderr:\n${stderr}`,
          ),
        );
      });
    };
    const onStdout = (data: Buffer) => {
      stdout += data.toString();
      if (stdout.includes(expectedOutput)) {
        settle(resolve);
      }
    };
    const onStderr = (data: Buffer) => {
      stderr += data.toString();
    };

    child.once('error', onError);
    child.once('close', onClose);
    child.stdout?.on('data', onStdout);
    child.stderr?.on('data', onStderr);

    if (child.exitCode !== null || child.signalCode !== null) {
      onClose(child.exitCode, child.signalCode);
    }
  });
}
