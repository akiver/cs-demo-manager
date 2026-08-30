import { handleError } from '../../handle-error';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import { generateMatchPositions } from 'csdm/node/database/matches/generate-match-positions';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { server } from 'csdm/server/server';

export type GenerateMatchPositionsPayload = {
  checksum: string;
  demoPath: string;
  source: DemoSource;
};

export async function generateMatchPositionsHandler({ checksum, demoPath, source }: GenerateMatchPositionsPayload) {
  try {
    await generateMatchPositions({
      demoPath,
      checksum,
      source,
      onInsertionStart: () => {
        server.sendPushMessage({
          name: ServerPushMessageName.InsertingMatchPositions,
        });
      },
    });
  } catch (error) {
    handleError(error, 'Error while generating match positions');
  }
}
