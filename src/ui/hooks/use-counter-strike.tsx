import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Status } from 'csdm/common/types/status';
import { useIsCsRunning } from './use-is-cs-running';
import { ErrorCode } from 'csdm/common/error-code';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import type { WatchDemoPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-demo-handler';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { Game } from 'csdm/common/types/counter-strike';
import type { WatchPlayerLowlightsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-lowlights-handler';
import type { WatchPlayerHighlightsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-highlights-handler';
import type { WatchPlayerAsSuspectPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-as-suspect-handler';
import type { WatchDemoErrorPayload } from 'csdm/server/handlers/renderer-process/counter-strike/counter-strike';

function getErrorMessageFromError(error: WatchDemoErrorPayload) {
  const { errorCode } = error;
  switch (errorCode) {
    case ErrorCode.DemoNotFound:
      return <Trans>Demo not found</Trans>;
    case ErrorCode.MatchNotFound:
      return <Trans>Match not found</Trans>;
    case ErrorCode.CounterStrikeExecutableNotFound:
      return (
        <div>
          <p>
            <Trans>Counter-Strike executable not found.</Trans>
          </p>
          {error.game === Game.CSGO && (
            <p>
              <Trans>
                Please make sure that CS:GO is installed by selecting the "csgo_legacy" branch from the CS2 "Betas"
                property tab on Steam.
              </Trans>
            </p>
          )}
        </div>
      );
    case ErrorCode.UnsupportedGame: {
      const game = error.game;
      return <Trans>{game} is not supported on your operating system</Trans>;
    }
    case ErrorCode.NoKillsFound:
      return <Trans>No kills found</Trans>;
    case ErrorCode.NoDeathsFound:
      return <Trans>No deaths found</Trans>;
    case ErrorCode.InvalidDemoPath:
      return <Trans>The demo's path contains unsupported characters by CSGO</Trans>;
    case ErrorCode.SteamNotRunning:
      return <Trans>Steam is not running</Trans>;
    default:
      return <Trans>An error occurred</Trans>;
  }
}

export function isCounterStrikeStartable(game: Game) {
  if (window.csdm.isMac) {
    return game === Game.CSGO;
  }

  return true;
}

export function isVideoGenerationAvailable(game: Game) {
  if (game === Game.CSGO) {
    return true;
  }

  return window.csdm.isWindows;
}

export function useCounterStrike() {
  const client = useWebSocketClient();
  const isCsRunning = useIsCsRunning();
  const showToast = useShowToast();
  const _ = useI18n();

  const isTelnetConnectionWorking = async () => {
    const telnetConnectionStatus = await client.send({
      name: RendererClientMessageName.GetCsgoTelenetConnectionStatus,
    });

    return telnetConnectionStatus === Status.Success;
  };

  const isKillCsRequired = async () => {
    const csRunning = await isCsRunning();
    if (csRunning) {
      if (window.csdm.isMac) {
        return true;
      }

      const isCs2Connected = await client.send({
        name: RendererClientMessageName.IsCs2ConnectedToServer,
      });

      if (isCs2Connected) {
        return false;
      }

      const telnetConnectionWorking = await isTelnetConnectionWorking();
      return !telnetConnectionWorking;
    }

    return false;
  };

  const listenForCsStarting = () => {
    const onCsStarting = () => {
      client.off(RendererServerMessageName.StartingGame, onCsStarting);

      showToast({
        id: 'game-starting',
        content: _(msg`Counter-Strike starting…`),
      });
    };

    client.on(RendererServerMessageName.StartingGame, onCsStarting);

    return () => {
      client.off(RendererServerMessageName.StartingGame, onCsStarting);
    };
  };

  const handleError = (error: WatchDemoErrorPayload | undefined) => {
    if (!error) {
      return;
    }

    const message = getErrorMessageFromError(error);
    showToast({
      content: message,
      id: `watch-demo-${error.demoPath}-error`,
      type: 'error',
    });
  };

  const watchDemo = async (options: WatchDemoPayload) => {
    const unlisten = listenForCsStarting();
    const error = await client.send({
      name: RendererClientMessageName.WatchDemo,
      payload: options,
    });
    unlisten();
    handleError(error);
  };

  const watchPlayerLowlights = async (options: WatchPlayerLowlightsPayload) => {
    const unlisten = listenForCsStarting();
    const error = await client.send({
      name: RendererClientMessageName.WatchPlayerLowlights,
      payload: options,
    });
    unlisten();
    handleError(error);
  };

  const watchPlayerHighlights = async (options: WatchPlayerHighlightsPayload) => {
    const unlisten = listenForCsStarting();
    const error = await client.send({
      name: RendererClientMessageName.WatchPlayerHighlights,
      payload: options,
    });
    unlisten();
    handleError(error);
  };

  const watchPlayerAsSuspect = async (options: WatchPlayerAsSuspectPayload) => {
    const unlisten = listenForCsStarting();
    const error = await client.send({
      name: RendererClientMessageName.WatchPlayerAsSuspect,
      payload: options,
    });
    unlisten();
    handleError(error);
  };

  return {
    watchDemo,
    watchPlayerLowlights,
    watchPlayerHighlights,
    watchPlayerAsSuspect,
    isKillCsRequired,
  };
}
