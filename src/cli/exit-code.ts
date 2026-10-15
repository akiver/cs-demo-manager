export const ExitCode = {
  Success: 0,
  Failure: 1,
  // Invalid arguments, options or unknown command.
  InvalidUsage: 2,
  // Interrupted with Ctrl+C, 128 + the SIGINT signal number by convention.
  Interrupted: 130,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];
