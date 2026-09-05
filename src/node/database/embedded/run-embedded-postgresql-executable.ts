import { spawn } from 'node:child_process';
import fs from 'fs-extra';

export type ExecutableResult = {
  exitCode: number | null;
  // stdout and stderr merged in the order they were received, empty when the output was redirected to a file.
  output: string;
};

type Options = {
  outputFilePath?: string;
};

// The PostgreSQL tools read their defaults from PG* environment variables (PGHOST, PGPORT, PGDATA…) which may be set
// on machines where PostgreSQL is installed, the embedded server must not be influenced by them.
function buildEnvironment() {
  const env = { ...process.env };
  for (const name of Object.keys(env)) {
    // Environment variable names are case-insensitive on Windows, "pgport" is read as PGPORT.
    if (name.toUpperCase().startsWith('PG')) {
      delete env[name];
    }
  }

  return env;
}

function run(executablePath: string, args: string[], outputFileDescriptor: number | null): Promise<ExecutableResult> {
  return new Promise((resolve, reject) => {
    const output = outputFileDescriptor ?? 'pipe';
    const child = spawn(executablePath, args, {
      env: buildEnvironment(),
      stdio: ['ignore', output, output],
      windowsHide: true,
    });
    const chunks: string[] = [];
    let isSettled = false;
    let flushTimeout: NodeJS.Timeout | null = null;

    const settle = (exitCode: number | null) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      if (flushTimeout !== null) {
        clearTimeout(flushTimeout);
      }

      // Release this process end of the pipes, another process may hold the other end open (see the "exit" listener)
      // and they would keep the event loop alive.
      child.stdout?.destroy();
      child.stderr?.destroy();
      resolve({
        exitCode,
        output: chunks.join('').trim(),
      });
    };

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');

    child.stdout?.on('data', (data: string) => {
      chunks.push(data);
    });

    child.stderr?.on('data', (data: string) => {
      chunks.push(data);
    });

    child.on('error', (error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      if (flushTimeout !== null) {
        clearTimeout(flushTimeout);
      }

      reject(error);
    });

    // "close" rather than "exit" when possible: the output streams may still have data after the process exited.
    child.on('close', settle);

    // How long the output streams are given to deliver their remaining data once the process has exited.
    const outputFlushTimeoutInMs = 1000;

    // Safety net: "close" is never emitted when a process left behind by the executable inherited the output pipes.
    // Settle once the remaining output had a chance to arrive.
    child.on('exit', (exitCode) => {
      flushTimeout = setTimeout(() => {
        settle(exitCode);
      }, outputFlushTimeoutInMs);
    });
  });
}

export async function runEmbeddedPostgreSqlExecutable(
  executablePath: string,
  args: string[],
  { outputFilePath }: Options = {},
): Promise<ExecutableResult> {
  if (outputFilePath === undefined) {
    return run(executablePath, args, null);
  }

  const outputFileDescriptor = await fs.open(outputFilePath, 'a');
  try {
    return await run(executablePath, args, outputFileDescriptor);
  } finally {
    await fs.close(outputFileDescriptor);
  }
}
