import { ErrorCode } from 'csdm/common/error-code';
import type { Game } from 'csdm/common/types/counter-strike';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { isValidGame } from 'csdm/common/types/is-valid-game';
import { server } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';

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
