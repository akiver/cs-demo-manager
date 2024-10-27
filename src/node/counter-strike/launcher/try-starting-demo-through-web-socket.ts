import { server } from 'csdm/server/server';
import { GameClientMessageName } from 'csdm/server/game-client-message-name';
import { GameServerMessageName } from 'csdm/server/game-server-message-name';
import { sleep } from 'csdm/common/sleep';

export async function tryStartingDemoThroughWebSocket(demoPath: string): Promise<boolean> {
  if (!server.isGameConnected()) {
    return false;
  }

  let hasReceivedMessage = false;
  const onGameResponse = () => {
    hasReceivedMessage = true;
  };

  server.addGameMessageListener(GameClientMessageName.Status, onGameResponse);

  server.sendMessageToGameProcess({
    name: GameServerMessageName.PlayDemo,
    payload: demoPath,
  });

  await sleep(1000);

  server.removeGameEventListeners(GameClientMessageName.Status);

  if (hasReceivedMessage) {
    return true;
  }

  logger.warn('CS is connected but we did not receive a response from it.');

  return false;
}
