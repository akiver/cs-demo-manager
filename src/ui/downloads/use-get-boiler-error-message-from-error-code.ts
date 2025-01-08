import { useLingui } from '@lingui/react/macro';
import { ErrorCode } from 'csdm/common/error-code';

export function useGetBoilerErrorMessageFromErrorCode() {
  const { t } = useLingui();

  return (message: string, errorCode: ErrorCode) => {
    switch (errorCode) {
      case ErrorCode.BoilerInvalidArgs:
        return t({
          context: 'Boiler-writter error message',
          message: 'Invalid arguments provided to boiler.',
        });
      case ErrorCode.BoilerCommunicationFailure:
        return t({
          context: 'Boiler-writter error message',
          message:
            'Error while contacting Steam, make sure your Steam account is not currently in-game on another device, otherwise please retry later.',
        });
      case ErrorCode.BoilerAlreadyConnected:
        return t({
          context: 'Boiler-writter error message',
          message: 'You are already connected to the CS game coordinator, make sure to close CS and retry.',
        });
      case ErrorCode.BoilerSteamRestartRequired:
        return t({
          context: 'Boiler-writter error message',
          message: 'Steam needs to be restarted.',
        });
      case ErrorCode.SteamNotRunning:
      case ErrorCode.BoilerSteamNotRunningOrLoggedIn:
        return t({
          context: 'Boiler-writter error message',
          message: 'Steam is not running or the current account is not logged in.',
        });
      case ErrorCode.BoilerUserNotConnected:
        return t({
          context: 'Boiler-writter error message',
          message: 'Steam account not connected.',
        });
      case ErrorCode.BoilerNoMatchesFound:
        return t({
          context: 'Boiler-writter error message',
          message: 'No matches found.',
        });
      case ErrorCode.BoilerWriteFileFailure:
        return t({
          context: 'Boiler-writter error message',
          message: 'An error occurred while writing the matches file.',
        });

      case ErrorCode.BoilerMatchesFileNotFound:
        return t({
          context: 'Boiler-writter error message',
          message: 'Matches file not found.',
        });
      default:
        return message;
    }
  };
}
