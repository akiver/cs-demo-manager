/**
 * Expected failure of a command, such as a missing account or an unreachable daemon.
 * Only its message, followed by the message of its cause if any, is printed, unexpected errors print their stack trace.
 */
export class CommandError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CommandError';
  }
}
