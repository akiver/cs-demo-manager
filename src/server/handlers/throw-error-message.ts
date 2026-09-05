/**
 * Logs the error and throws its message so the renderer process displays it as is.
 * For errors carrying an ErrorCode the UI can translate, use handleError instead.
 */
export function throwErrorMessage(error: unknown, logMessage: string): never {
  logger.error(logMessage);
  logger.error(error);

  throw error instanceof Error ? error.message : 'Unknown error';
}
