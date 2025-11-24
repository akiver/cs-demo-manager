import React, { useEffect } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import type { CounterStrikeErrorPayload, WatchDemoErrorPayload } from 'csdm/server/counter-strike';
import { ErrorCode } from 'csdm/common/error-code';
import { Game } from 'csdm/common/types/counter-strike';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { HlaeError } from 'csdm/ui/components/messages/hlae-error';

function getErrorMessageFromError(error: WatchDemoErrorPayload | CounterStrikeErrorPayload) {
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
    case ErrorCode.CounterStrikeAlreadyRunning: {
      const game = error.game;
      return <Trans>{game} is already running</Trans>;
    }
    default:
      return <Trans>An error occurred</Trans>;
  }
}

export function useRegisterCounterStrikeListeners(client: WebSocketClient) {
  const showToast = useShowToast();
  const { t } = useLingui();

  useEffect(() => {
    const onGameStart = () => {
      showToast({
        id: 'game-starting',
        content: t`Counter-Strike starting…`,
      });
    };

    const onError = (error: CounterStrikeErrorPayload | WatchDemoErrorPayload) => {
      const message = getErrorMessageFromError(error);
      showToast({
        content: message,
        id: 'game-starting',
        type: 'error',
      });
    };

    client.on(RendererServerMessageName.StartingCounterStrike, onGameStart);
    client.on(RendererServerMessageName.CounterStrikeError, onError);

    return () => {
      client.off(RendererServerMessageName.StartingCounterStrike, onGameStart);
      client.off(RendererServerMessageName.CounterStrikeError, onError);
    };
  });
}
