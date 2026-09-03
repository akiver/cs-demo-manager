import { assertSoftNever } from 'csdm/common/assert-soft-never';
import { ErrorCode } from 'csdm/common/error-code';

export function getErrorCodeMessage(errorCode: ErrorCode): string {
  switch (errorCode) {
    case ErrorCode.UnknownError:
      return 'An unknown error occurred, see the log file for details.';
    case ErrorCode.NetworkError:
      return 'A network error occurred, check your internet connection.';
    case ErrorCode.DemoNotFound:
      return 'Demo not found.';
    case ErrorCode.MatchNotFound:
      return 'Match not found in the database, make sure the demo has been analyzed.';
    case ErrorCode.InvalidDemoPath:
      return 'The demo path contains characters that are not supported by Counter-Strike. Move the demo in a folder that contains only Basic Latin characters, see https://cs-demo-manager.com/docs/guides/playback#cs2-demo-playback-doesnt-start-or-crashes';
    case ErrorCode.InvalidDemoHeader:
      return 'The demo header is invalid, the file may be corrupted.';
    case ErrorCode.InvalidDemoName:
      return 'The demo name is invalid.';
    case ErrorCode.InvalidMatchDate:
      return 'The match date is invalid.';
    case ErrorCode.AnalyzeCorruptedDemo:
      return 'The demo is corrupted and could not be analyzed.';
    case ErrorCode.InsertMatchDuplicatedChecksum:
      return 'The match is already in the database.';
    case ErrorCode.InsertRoundsError:
      return 'Error while inserting the match rounds into the database.';
    case ErrorCode.DatabaseSchemaVersionMismatch:
      return 'The database schema is outdated, start the GUI to run the migrations.';
    case ErrorCode.EmbeddedDatabaseLocked:
      return 'The embedded database is already in use, probably by the CS Demo Manager app. Close it and try again.';
    case ErrorCode.StartCounterStrikeError:
      return 'Failed to start the game, make sure Steam is running and you are connected.';
    case ErrorCode.CounterStrikeExecutableNotFound:
      return 'Counter-Strike executable not found, see https://cs-demo-manager.com/docs/guides/playback#counter-strike-executable-not-found';
    case ErrorCode.CustomCounterStrikeExecutableNotFound:
      return 'Counter-Strike executable not found, check your app playback settings.';
    case ErrorCode.UnsupportedGame:
      return 'This game is not supported on your operating system.';
    case ErrorCode.CounterStrikeAlreadyRunning:
      return 'Counter-Strike is already running.';
    case ErrorCode.CounterStrikeNotRunning:
      return 'Counter-Strike is not running.';
    case ErrorCode.CounterStrikeNotConnected:
      return 'Unable to communicate with Counter-Strike.';
    case ErrorCode.CounterStrikeNoResponse:
      return 'Counter-Strike did not respond, please try again.';
    case ErrorCode.CounterStrikeVideoConfigNotFound:
      return 'Counter-Strike video config file not found, make sure the game has been launched at least once from Steam.';
    case ErrorCode.GameError:
      return 'The game crashed, see https://cs-demo-manager.com/docs/guides/playback#cs2-demo-playback-doesnt-start-or-crashes';
    case ErrorCode.AccessDenied:
      return 'The game process exited with an access denied error, make sure to close any anti-cheat software and retry.';
    case ErrorCode.SteamNotRunning:
      return 'Steam is not running.';
    case ErrorCode.HlaeNotInstalled:
      return 'HLAE is not installed.';
    case ErrorCode.HlaeError:
      return 'HLAE returned an error.';
    case ErrorCode.InvalidHlaeExecutable:
      return 'The HLAE executable is invalid.';
    case ErrorCode.VirtualDubNotInstalled:
      return 'VirtualDub is not installed.';
    case ErrorCode.VirtualDubError:
      return 'VirtualDub returned an error.';
    case ErrorCode.FfmpegNotInstalled:
      return 'FFmpeg is not installed.';
    case ErrorCode.FfmpegError:
      return 'FFmpeg returned an error.';
    case ErrorCode.InvalidFfmpegExecutable:
      return 'The FFmpeg executable is invalid.';
    case ErrorCode.NoSequencesFound:
      return 'No sequences provided.';
    case ErrorCode.NoKillsFound:
      return 'No kills found.';
    case ErrorCode.NoDeathsFound:
      return 'No deaths found.';
    case ErrorCode.NoRoundsFound:
      return 'No rounds found.';
    case ErrorCode.RoundNotFound:
      return 'Round not found.';
    case ErrorCode.PlayerNotFound:
      return 'Player not found.';
    case ErrorCode.TeamNotFound:
      return 'Team not found.';
    case ErrorCode.TeamsNotFound:
      return 'Teams not found.';
    case ErrorCode.DuplicateTeamName:
      return 'A team with this name already exists.';
    case ErrorCode.MissingPlayerSlot:
      return 'This demo needs to be re-analyzed to make the camera focus work.';
    case ErrorCode.WavFileNotFound:
      return 'WAV file not found.';
    case ErrorCode.RawFilesNotFound:
      return 'Raw files not found.';
    case ErrorCode.BadCpuType:
      return 'The executable is not compatible with your CPU architecture.';
    case ErrorCode.FileNotFound:
      return 'File not found.';
    case ErrorCode.DownloadFolderNotExists:
      return 'The download folder does not exist.';
    case ErrorCode.DownloadFolderNotDefined:
      return 'The download folder is not defined, set it from the GUI settings.';
    case ErrorCode.DecodeShareCodeError:
      return 'Failed to decode the share code.';
    case ErrorCode.InvalidShareCode:
      return 'The share code is invalid.';
    case ErrorCode.MatchAlreadyInDownloadQueue:
      return 'The match is already in the download queue.';
    case ErrorCode.MatchAlreadyDownloaded:
      return 'The match has already been downloaded.';
    case ErrorCode.DemoLinkExpired:
      return 'The demo link has expired.';
    case ErrorCode.WriteDemoInfoFileError:
      return 'An error occurred while writing the demo information file.';
    case ErrorCode.ChecksumsMismatch:
      return 'The demo checksums do not match.';
    case ErrorCode.MapAlreadyExists:
      return 'This map already exists.';
    case ErrorCode.BoilerInvalidArgs:
      return 'Invalid arguments provided to boiler.';
    case ErrorCode.BoilerCommunicationFailure:
      return 'Error while contacting Steam, make sure your Steam account is not currently in-game on another device, otherwise please retry later.';
    case ErrorCode.BoilerAlreadyConnected:
      return 'You are already connected to the CS game coordinator, make sure to close CS and retry.';
    case ErrorCode.BoilerSteamRestartRequired:
      return 'Steam needs to be restarted.';
    case ErrorCode.BoilerSteamNotRunningOrLoggedIn:
      return 'Steam is not running or the current account is not logged in.';
    case ErrorCode.BoilerUserNotConnected:
      return 'Steam account not connected.';
    case ErrorCode.BoilerNoMatchesFound:
      return 'No matches found.';
    case ErrorCode.BoilerWriteFileFailure:
      return 'An error occurred while writing the matches file.';
    case ErrorCode.BoilerMatchesFileNotFound:
      return 'Matches file not found.';
    case ErrorCode.BoilerUnknownError:
      return 'An unknown error occurred while communicating with Steam.';
    case ErrorCode.CsVoiceExtractorInvalidArgs:
      return 'Invalid arguments provided to the voice extractor.';
    case ErrorCode.CsVoiceExtractorLoadCsgoLibError:
      return 'Failed to load the Counter-Strike audio library.';
    case ErrorCode.CsVoiceExtractorParsingError:
      return 'Failed to parse the demo.';
    case ErrorCode.CsVoiceExtractorUnsupportedAudioCodec:
      return 'Unsupported audio codec.';
    case ErrorCode.CsVoiceExtractorNoVoiceDataFound:
      return 'No voice data found in the demo.';
    case ErrorCode.CsVoiceExtractorDecodingError:
      return 'Error while decoding voice data.';
    case ErrorCode.CsVoiceExtractorCreateAudioFileError:
      return 'Failed to create the audio file.';
    case ErrorCode.CsVoiceExtractorOpenDemoError:
      return 'Failed to open the demo file.';
    case ErrorCode.CsVoiceExtractorUnsupportedDemoFormat:
      return 'This demo format is not supported.';
    case ErrorCode.CsVoiceExtractorMissingLibraryFiles:
      return 'Some required library files are missing.';
    case ErrorCode.SteamApiForbidden:
      return 'The Steam API returned a forbidden error.';
    case ErrorCode.SteamApiError:
      return 'The Steam API returned an error.';
    case ErrorCode.SteamApiTooManyRequests:
      return 'Too many requests sent to the Steam API, please retry later.';
    case ErrorCode.FaceItApiForbidden:
      return 'The FACEIT API returned a forbidden error.';
    case ErrorCode.FaceItApiError:
      return 'The FACEIT API returned an error.';
    case ErrorCode.FaceItApiResourceNotFound:
      return 'Resource not found on FACEIT.';
    case ErrorCode.FaceItApiUnauthorized:
      return 'Unauthorized FACEIT API request.';
    case ErrorCode.FaceItApiInvalidRequest:
      return 'Invalid FACEIT API request.';
    case ErrorCode.FiveEPlayApiError:
      return 'The 5EPlay API returned an error.';
    case ErrorCode.FiveEPlayApiResourceNotFound:
      return 'Resource not found on 5EPlay.';
    case ErrorCode.FiveEPlayApiInvalidRequest:
      return 'Invalid 5EPlay API request.';
    case ErrorCode.RenownApiError:
      return 'The Renown API returned an error.';
    case ErrorCode.RenownApiResourceNotFound:
      return 'Resource not found on Renown.';
    case ErrorCode.RenownTooManyRequests:
      return 'Too many requests sent to the Renown API, please retry later.';
    case ErrorCode.RenownInvalidRequest:
      return 'Invalid Renown API request.';
    case ErrorCode.SteamAccountAlreadyIgnored:
      return 'This Steam account is already ignored.';
    case ErrorCode.SteamAccountNotFound:
      return 'Steam account not found.';
    case ErrorCode.InvalidSteamCommunityUrl:
      return 'Invalid Steam community URL.';
    case ErrorCode.SteamAccountNameTooLong:
      return 'The Steam account name is too long.';
    case ErrorCode.TagNameAlreadyTaken:
      return 'A tag with this name already exists.';
    case ErrorCode.TagNameTooShort:
      return 'The tag name is too short.';
    case ErrorCode.TagNameTooLong:
      return 'The tag name is too long.';
    case ErrorCode.InvalidTagColor:
      return 'The tag color is invalid.';
    case ErrorCode.TagNotFound:
      return 'Tag not found.';
    case ErrorCode.CameraAlreadyExists:
      return 'This camera already exists.';
    case ErrorCode.InvalidBackupFile:
      return 'The backup file is invalid.';
    case ErrorCode.InvalidFileExtension:
      return 'The file extension is invalid.';
    case ErrorCode.InvalidJson:
      return 'The JSON is invalid.';
    default:
      return assertSoftNever(
        errorCode,
        `An error occurred (error code ${errorCode as number}), see the log file for details.`,
      );
  }
}
