import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useIsCsRunning } from './use-is-cs-running';
import { ErrorCode } from 'csdm/common/error-code';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import type { WatchDemoPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-demo-handler';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { Game } from 'csdm/common/types/counter-strike';
import type { WatchPlayerLowlightsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-lowlights-handler';
import type { WatchPlayerHighlightsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-highlights-handler';
import type { WatchPlayerAsSuspectPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-as-suspect-handler';
import type { WatchDemoErrorPayload } from 'csdm/server/handlers/renderer-process/counter-strike/counter-strike';
import { ExternalLink } from '../components/external-link';
import type { WatchPlayerRoundsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-rounds-handler';
import { HlaeError } from 'csdm/ui/components/messages/hlae-error';

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
          {window.csdm.isLinux && (
            <p>
              <Trans>Make sure Steam is not installed through Flatpak as it's not supported!</Trans>
            </p>
          )}
          {error.game === Game.CSGO && (
            <p>
              <Trans>
                Please make sure that CS:GO is installed by selecting the "csgo_legacy" branch from the CS2 "Betas"
                property tab on Steam.
              </Trans>
            </p>
          )}
          <p>
            <Trans>
              Read the{' '}
              <ExternalLink href="https://cs-demo-manager.com/docs/guides/playback">documentation</ExternalLink> for
              more information.
            </Trans>
          </p>
        </div>
      );
    case ErrorCode.CustomCounterStrikeExecutableNotFound:
      return (
        <p>
          <Trans>Counter-Strike executable not found, check your app playback settings.</Trans>
        </p>
      );
    case ErrorCode.UnsupportedGame: {
      const game = error.game;
      return <Trans>{game} is not supported on your operating system</Trans>;
    }
    case ErrorCode.HlaeNotInstalled: {
      return <Trans>HLAE executable not found</Trans>;
    }
    case ErrorCode.NoKillsFound:
      return <Trans>No kills found</Trans>;
    case ErrorCode.MissingPlayerSlot:
      return (
        <p>
          <Trans>This demo needs to be re-analyzed to make the camera focus work.</Trans>
        </p>
      );
    case ErrorCode.NoRoundsFound:
      return <Trans>No rounds found</Trans>;
    case ErrorCode.NoDeathsFound:
      return <Trans>No deaths found</Trans>;
    case ErrorCode.InvalidDemoPath:
      return (
        <div>
          <p>
            <Trans>
              The demo's path contains characters that are not supported by Counter-Strike and would prevent playback.
            </Trans>
          </p>
          <p>
            <Trans>
              You have to move the demo in a folder that contains only Basic Latin characters - see{' '}
              <ExternalLink href="https://cs-demo-manager.com/docs/guides/playback#cs2-demo-playback-doesnt-start-or-crashes">
                this documentation
              </ExternalLink>{' '}
              for details.
            </Trans>
          </p>
        </div>
      );
    case ErrorCode.SteamNotRunning:
      return <Trans>Steam is not running</Trans>;
    case ErrorCode.GameError:
      return (
        <p>
          <Trans>
            The game crashed, please see{' '}
            <ExternalLink href="https://cs-demo-manager.com/docs/guides/playback#cs2-demo-playback-doesnt-start-or-crashes">
              this documentation
            </ExternalLink>{' '}
            for help.
          </Trans>
        </p>
      );
    case ErrorCode.HlaeError:
      return <HlaeError />;
    case ErrorCode.AccessDenied:
      return (
        <div>
          <p>
            <Trans>The game process exited with an access denied error.</Trans>
          </p>
          <p>
            <Trans>Make sure to close any anti-cheat software and retry.</Trans>
          </p>
        </div>
      );
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

  return !window.csdm.isMac;
}

export function useCounterStrike() {
  const client = useWebSocketClient();
  const isCsRunning = useIsCsRunning();
  const showToast = useShowToast();
  const { t } = useLingui();

  const isKillCsRequired = async () => {
    const csRunning = await isCsRunning();
    if (csRunning) {
      const isCs2Connected = await client.send({
        name: RendererClientMessageName.IsCs2ConnectedToServer,
      });

      return !isCs2Connected;
    }

    return false;
  };

  const listenForCsStarting = () => {
    const onCsStarting = () => {
      client.off(RendererServerMessageName.StartingGame, onCsStarting);

      showToast({
        id: 'game-starting',
        content: t`Counter-Strike starting…`,
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
      id: 'game-starting',
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

  const watchPlayerRounds = async (options: WatchPlayerRoundsPayload) => {
    const unlisten = listenForCsStarting();
    const error = await client.send({
      name: RendererClientMessageName.WatchPlayerRounds,
      payload: options,
    });
    unlisten();
    handleError(error);
  };

  return {
    watchDemo,
    watchPlayerRounds,
    watchPlayerLowlights,
    watchPlayerHighlights,
    watchPlayerAsSuspect,
    isKillCsRequired,
  };
}
