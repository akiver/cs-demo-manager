import type { KrispShotSettings } from 'csdm/common/types/krispshot';
import { krispShotWorker } from 'csdm/server/krispshot/krispshot-worker';

// Errors are returned as text (not thrown): the UI shows the website's answer as it is.
export async function testKrispShotConnectionHandler(payload: Partial<KrispShotSettings>): Promise<string> {
  try {
    return await krispShotWorker.testConnection(payload);
  } catch (error) {
    return `Failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
