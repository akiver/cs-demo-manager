// window error handler for the renderer process and preload script.
export function onWindowError(event: ErrorEvent) {
  event.preventDefault();
  const { error } = event;

  // The stack field is erased when the error comes from a preload script.
  // It could be related to the context bridge limitations, see the following documentation:
  // https://www.electronjs.org/docs/latest/api/context-bridge#parameter--error--return-type-support
  // https://github.com/electron/electron/issues/25596
  if (error instanceof Error && typeof error.stack === 'string') {
    logger.error(error.stack);
    return;
  }

  logger.error(error ?? event.message);
}
