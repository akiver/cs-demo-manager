// eslint-disable-next-line @typescript-eslint/no-require-imports
const nativeModule = require('./build/Release/get_running_process_exit_code.node');

export async function getRunningProcessExitCode(processName: string): Promise<number> {
  logger.log(`Waiting for process ${processName} to exit`);
  const exitCode = await nativeModule.getRunningProcessExitCode(processName);
  logger.log(`Process ${processName} exited with code ${exitCode}`);

  return exitCode;
}
