import type { KrispShotSettings, KrispShotState } from 'csdm/common/types/krispshot';
import { krispShotWorker } from 'csdm/server/krispshot/krispshot-worker';
import { handleError } from '../../handle-error';

export async function updateKrispShotSettingsHandler(payload: Partial<KrispShotSettings>): Promise<KrispShotState> {
  try {
    return await krispShotWorker.updateSettings(payload);
  } catch (error) {
    handleError(error, 'Error while updating the KrispShot settings');
  }
}
