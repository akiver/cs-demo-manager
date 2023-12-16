import { connectDatabase } from 'csdm/node/database/connect-database';

export async function startMinimizedModeHandler(): Promise<void> {
  return new Promise((resolve) => {
    let timer: NodeJS.Timeout | null = null;

    const startMinimizedMode = async () => {
      try {
        await connectDatabase();
        if (timer !== null) {
          globalThis.clearInterval(timer);
        }
        return resolve();
      } catch (error) {
        logger.log('Error while starting minimized mode');
        logger.error(error);
      }
    };

    // Retry multiple times to start in minimized mode because when it's automatically launched at startup the database
    // process might not be ready yet.
    timer = globalThis.setInterval(startMinimizedMode, 10_000);
    startMinimizedMode();
  });
}
