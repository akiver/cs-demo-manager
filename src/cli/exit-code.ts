export const ExitCode = {
  Success: 0,
  Failure: 1,
  // Invalid arguments, options or unknown command.
  InvalidUsage: 2,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];
