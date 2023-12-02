import { msg } from '@lingui/macro';
import { ErrorCode } from 'csdm/common/error-code';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useGetBoilerErrorMessageFromErrorCode() {
  const _ = useI18n();

  return (message: string, errorCode: ErrorCode) => {
    switch (errorCode) {
      case ErrorCode.BoilerInvalidArgs:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'Invalid arguments provided to boiler.',
          }),
        );
      case ErrorCode.BoilerCommunicationFailure:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'Error while contacting Steam, please retry later.',
          }),
        );
      case ErrorCode.BoilerAlreadyConnected:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'You are already connected to the CS game coordinator, make sure to close CS and retry.',
          }),
        );
      case ErrorCode.BoilerSteamRestartRequired:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'Steam needs to be restarted.',
          }),
        );
      case ErrorCode.SteamNotRunning:
      case ErrorCode.BoilerSteamNotRunningOrLoggedIn:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'Steam is not running or the current account is not logged in.',
          }),
        );
      case ErrorCode.BoilerUserNotConnected:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'Steam account not connected.',
          }),
        );
      case ErrorCode.BoilerNoMatchesFound:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'No matches found.',
          }),
        );
      case ErrorCode.BoilerWriteFileFailure:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'An error occurred while writing the matches file.',
          }),
        );

      case ErrorCode.BoilerMatchesFileNotFound:
        return _(
          msg({
            context: 'Boiler-writter error message',
            message: 'Matches file not found.',
          }),
        );
      default:
        return message;
    }
  };
}
