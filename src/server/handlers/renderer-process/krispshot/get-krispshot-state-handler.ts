import type { KrispShotState } from 'csdm/common/types/krispshot';
import { krispShotWorker } from 'csdm/server/krispshot/krispshot-worker';

export async function getKrispShotStateHandler(): Promise<KrispShotState> {
  return krispShotWorker.getState();
}
