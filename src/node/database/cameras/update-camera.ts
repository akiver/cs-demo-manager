import { db } from 'csdm/node/database/database';
import type { UpdatableCamera } from './cameras-table';

export async function updateCamera(camera: UpdatableCamera) {
  const updatedCamera = await db
    .updateTable('cameras')
    .set(camera)
    .where('id', '=', camera.id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updatedCamera;
}
