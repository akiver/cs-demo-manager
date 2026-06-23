# get-running-process-exit-code

A tiny **Windows-only** native Node.js addon (N-API) that waits for an already-running process to exit and resolves with its exit code.

## Why this exists

When CS Demo Manager launches Counter-Strike through HLAE, the HLAE process itself exits almost immediately while the game keeps running. To know whether the game session ended cleanly, we need to wait on the actual `cs2.exe` / `csgo.exe` process and read its exit code — something Node.js can't do for a process it didn't spawn. This addon does exactly that by looking the process up by name and waiting on its handle.

See [start-counter-strike-with-hlae.ts](../../counter-strike/launcher/start-counter-strike-with-hlae.ts) for usage.

## Usage

```ts
import { getRunningProcessExitCode } from 'csdm/node/os/get-running-process-exit-code/get-running-process-exit-code';

const exitCode = await getRunningProcessExitCode('cs2.exe');
if (exitCode === 0) {
  // Process exited cleanly
}
```

## Errors

The promise rejects with an `Error` whose `code` property identifies the failure:

| Code                    | Meaning                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `ERR_INVALID_ARGUMENT`  | No process name was provided.                                                 |
| `ERR_SNAPSHOT_FAILED`   | Could not enumerate running processes.                                        |
| `ERR_PROCESS_NOT_FOUND` | No running process matched the given name.                                    |
| `ERR_OPEN_PROCESS`      | The process was found but couldn't be opened (e.g. insufficient permissions). |
| `ERR_WAIT_PROCESS`      | Waiting on the process handle failed.                                         |
| `ERR_GET_EXIT_CODE`     | The process exited but its exit code couldn't be read.                        |
| `ERR_UNKNOWN`           | Any other unexpected failure.                                                 |

## Building

The addon only compiles on Windows. From this directory:

```sh
pnpm run node-gyp configure
pnpm run build
```

The compiled binary lands in `build/Release/get_running_process_exit_code.node`, which the TypeScript wrapper loads at runtime.
