import { ErrorCode } from 'csdm/common/error-code';
import type { Game } from 'csdm/common/types/counter-strike';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { isValidGame } from 'csdm/common/types/is-valid-game';
import { server, type GameListener, type SendableGameMessage } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import type { GameClientMessageName, GameClientMessagePayload } from 'csdm/server/game-client-message-name';
import type { GameServerMessageName } from 'csdm/server/game-server-message-name';
import { sleep } from 'csdm/common/sleep';
import { CounterStrikeNotConnected } from 'csdm/node/counter-strike/launcher/errors/counter-strike-not-connected';
import { CounterStrikeNoResponse } from 'csdm/node/counter-strike/launcher/errors/counter-strike-no-response';

export function onGameStart() {
  server.sendMessageToRendererProcess({
    name: RendererServerMessageName.StartingCounterStrike,
  });
}

export type CounterStrikeErrorPayload = {
  errorCode: ErrorCode;
  game?: Game;
};

export type WatchDemoErrorPayload = CounterStrikeErrorPayload & {
  demoPath: string;
};

function buildCounterStrikeErrorPayload(error: unknown, message: string): CounterStrikeErrorPayload {
  const errorCode = getErrorCodeFromError(error);
  if (errorCode === ErrorCode.UnknownError) {
    logger.error(message);
    logger.error(error);
  }
  let game: Game | undefined;
  if (error && typeof error === 'object' && 'game' in error && isValidGame(error.game)) {
    game = error.game;
  }
  const payload: CounterStrikeErrorPayload = {
    errorCode,
    game,
  };

  return payload;
}

export function handleCounterStrikeError(error: unknown) {
  const payload = buildCounterStrikeErrorPayload(error, 'Error starting Counter-Strike');
  server.sendMessageToRendererProcess({
    name: RendererServerMessageName.CounterStrikeError,
    payload,
  });

  return payload;
}

export function handleWatchDemoError(error: unknown, demoPath: string, message: string) {
  const payload: WatchDemoErrorPayload = {
    ...buildCounterStrikeErrorPayload(error, message),
    demoPath,
  };
  server.sendMessageToRendererProcess({
    name: RendererServerMessageName.CounterStrikeError,
    payload,
  });

  return payload;
}

type SendMessageToGameOptions<MessageName extends GameClientMessageName> = {
  message: SendableGameMessage<GameServerMessageName>;
  responseMessageName: MessageName;
  onResponse?: GameListener<MessageName>;
};

export async function sendMessageToGame<MessageName extends GameClientMessageName>({
  message,
  responseMessageName,
  onResponse,
}: SendMessageToGameOptions<MessageName>): Promise<void> {
  if (!server.isGameConnected()) {
    throw new CounterStrikeNotConnected();
  }

  let hasReceivedMessage = false;
  const handleResponse = (data: GameClientMessagePayload[MessageName]) => {
    hasReceivedMessage = true;
    onResponse?.(data);
  };

  server.addGameMessageListener(responseMessageName, handleResponse);
  server.sendMessageToGameProcess(message);

  await sleep(2000);

  server.removeGameEventListeners(responseMessageName);

  if (hasReceivedMessage) {
    return;
  }

  logger.warn('CS is connected but we did not receive a response from it.');

  throw new CounterStrikeNoResponse();
}
