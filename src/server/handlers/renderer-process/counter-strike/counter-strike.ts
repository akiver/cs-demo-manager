import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import { ErrorCode } from 'csdm/common/error-code';
import type { Game } from 'csdm/common/types/counter-strike';
import { CounterStrikeExecutableNotFound } from 'csdm/node/counter-strike/launcher/errors/counter-strike-executable-not-found';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { UnsupportedGame } from 'csdm/node/counter-strike/launcher/errors/unsupported-game';
import { CustomCounterStrikeExecutableNotFound } from 'csdm/node/counter-strike/launcher/errors/custom-counter-strike-executable-not-found';

export type WatchDemoErrorPayload = {
  demoPath: string;
  errorCode: ErrorCode;
  game?: Game;
};

export function onGameStart() {
  server.sendMessageToRendererProcess({
    name: RendererServerMessageName.StartingGame,
  });
}

export function buildWatchDemoErrorPayload(error: unknown, demoPath: string, message: string): WatchDemoErrorPayload {
  const errorCode = getErrorCodeFromError(error);
  if (errorCode === ErrorCode.UnknownError) {
    logger.error(message);
    logger.error(error);
  }
  let game: Game | undefined;
  if (
    error instanceof CounterStrikeExecutableNotFound ||
    error instanceof CustomCounterStrikeExecutableNotFound ||
    error instanceof UnsupportedGame
  ) {
    game = error.game;
  }
  const payload: WatchDemoErrorPayload = {
    demoPath,
    errorCode,
    game,
  };

  return payload;
}
