import { sql } from 'kysely';
import { server } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { deletePositions } from 'csdm/node/database/delete-positions';
import { deleteOrphanDemos } from 'csdm/node/database/demos/delete-orphan-demos';
import { deleteDemos } from 'csdm/node/database/demos/delete-demos';
import { db } from 'csdm/node/database/database';

export type OptimizeDatabasePayload = {
  clearPositions: boolean;
  clearOrphanDemos: boolean;
  clearDemos: boolean;
};

export async function optimizeDatabaseHandler({
  clearPositions,
  clearOrphanDemos,
  clearDemos,
}: OptimizeDatabasePayload) {
  try {
    if (clearDemos) {
      await deleteDemos();
    } else if (clearOrphanDemos) {
      await deleteOrphanDemos();
    }

    if (clearPositions) {
      await deletePositions();
      await sql`VACUUM FULL`.execute(db);
    }

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.OptimizeDatabaseSuccess,
    });
  } catch (error) {
    logger.error('Error while optimizing database');
    logger.error(error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw errorMessage;
  }
}
