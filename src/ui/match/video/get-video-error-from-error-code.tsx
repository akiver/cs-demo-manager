import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ErrorCode } from 'csdm/common/error-code';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { Game } from 'csdm/common/types/counter-strike';
import { HlaeError } from 'csdm/ui/components/messages/hlae-error';

export function getVideoErrorMessageFromErrorCode(game: Game, errorCode: ErrorCode) {
  switch (errorCode) {
    case ErrorCode.DemoNotFound:
      return (
        <p>
          <Trans>Demo not found.</Trans>
        </p>
      );
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
    case ErrorCode.StartCounterStrikeError:
      return (
        <div className="flex flex-col gap-y-4">
          <p>
            <Trans>Failed to start the game, make sure Steam is running and you are connected.</Trans>
          </p>
          {game === Game.CSGO && (
            <p>
              <Trans>
                Please make sure that CS:GO is installed by selecting the <strong>csgo_legacy</strong> branch from the
                CS2 "Betas" property tab on Steam.
              </Trans>
            </p>
          )}
        </div>
      );
    case ErrorCode.CounterStrikeExecutableNotFound:
      return (
        <p>
          <Trans>Counter-Strike executable not found.</Trans>
        </p>
      );
    case ErrorCode.CustomCounterStrikeExecutableNotFound:
      return (
        <p>
          <Trans>Counter-Strike executable not found, check your app playback settings.</Trans>
        </p>
      );
    case ErrorCode.HlaeNotInstalled:
      return (
        <p>
          <Trans>HLAE is not installed.</Trans>
        </p>
      );
    case ErrorCode.VirtualDubNotInstalled:
      return (
        <p>
          <Trans>VirtualDub is not installed.</Trans>
        </p>
      );
    case ErrorCode.FfmpegNotInstalled:
      return (
        <p>
          <Trans>FFmpeg is not installed.</Trans>
        </p>
      );
    case ErrorCode.NoSequencesFound:
      return (
        <p>
          <Trans>No sequences provided.</Trans>
        </p>
      );
    case ErrorCode.SteamNotRunning:
      return (
        <p>
          <Trans>Steam is not running.</Trans>
        </p>
      );
    case ErrorCode.FfmpegError:
      return (
        <p>
          <Trans>FFmpeg returned an error.</Trans>
        </p>
      );
    case ErrorCode.VirtualDubError:
      return (
        <p>
          <Trans>VirtualDub returned an error.</Trans>
        </p>
      );
    case ErrorCode.WavFileNotFound:
      return (
        <p>
          <Trans>WAV file not found.</Trans>
        </p>
      );
    case ErrorCode.RawFilesNotFound:
      return (
        <p>
          <Trans>Raw files not found.</Trans>
        </p>
      );
    case ErrorCode.GameError:
      return (
        <p>
          <Trans>Counter-Strike crashed.</Trans>
        </p>
      );
    case ErrorCode.HlaeError:
      return <HlaeError />;
    default:
      return (
        <p>
          <Trans>An error occurred.</Trans>
        </p>
      );
  }
}
