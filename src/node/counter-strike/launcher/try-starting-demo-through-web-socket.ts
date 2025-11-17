import { GameClientMessageName } from 'csdm/server/game-client-message-name';
import { GameServerMessageName } from 'csdm/server/game-server-message-name';
import { sendMessageToGame } from 'csdm/server/counter-strike';

export async function tryStartingDemoThroughWebSocket(demoPath: string) {
  return await sendMessageToGame({
    message: {
      name: GameServerMessageName.PlayDemo,
      payload: demoPath,
    },
    responseMessageName: GameClientMessageName.Status,
  });
}
