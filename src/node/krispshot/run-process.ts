import { spawn, spawnSync } from 'node:child_process';

export type RunResult = { code: number; output: string };

type RunOptions = {
  onLine?: (line: string) => void;
  signal?: AbortSignal;
};

/** Runs a program without a shell, streams its output lines and kills the whole process tree on abort. */
export function runProcess(command: string, args: string[], { onLine, signal }: RunOptions = {}): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let output = '';
    let buffer = '';
    const take = (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      if (output.length > 400_000) {
        output = output.slice(-200_000);
      }
      buffer += text;
      const lines = buffer.split(/\r?\n|\r/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim() !== '') {
          onLine?.(line);
        }
      }
    };
    child.stdout.on('data', take);
    child.stderr.on('data', take);
    const onAbort = () => killProcessTree(child.pid);
    signal?.addEventListener('abort', onAbort, { once: true });
    child.on('error', (error) => {
      signal?.removeEventListener('abort', onAbort);
      reject(error);
    });
    child.on('close', (code) => {
      signal?.removeEventListener('abort', onAbort);
      if (buffer.trim() !== '') {
        onLine?.(buffer);
      }
      resolve({ code: code ?? -1, output });
    });
  });
}

export function killProcessTree(pid: number | undefined) {
  if (!pid) {
    return;
  }
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true });
    } else {
      process.kill(pid, 'SIGKILL');
    }
  } catch {
    // already gone
  }
}
