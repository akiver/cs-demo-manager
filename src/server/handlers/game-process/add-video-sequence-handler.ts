import type { GameVideoSequencePayload } from 'csdm/server/messages/game-client-message-name';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { server } from 'csdm/server/server';

export function addVideoSequenceHandler(payload: GameVideoSequencePayload) {
  server.sendPushMessage({
    name: ServerPushMessageName.AddVideoSequence,
    payload,
  });

  return Promise.resolve();
}
