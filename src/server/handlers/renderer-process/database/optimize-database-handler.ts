import { server } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { deletePositions } from 'csdm/node/database/delete-positions';
import { deleteOrphanDemos } from 'csdm/node/database/demos/delete-orphan-demos';

export type OptimizeDatabasePayload = {
  clearPositions: boolean;
  clearDemos: boolean;
};

export async function optimizeDatabaseHandler({ clearPositions, clearDemos }: OptimizeDatabasePayload) {
  try {
    if (clearPositions) {
      await deletePositions();
    }
    if (clearDemos) {
      await deleteOrphanDemos();
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
