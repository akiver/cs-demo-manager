import path from 'node:path';
import { execFile } from 'node:child_process';
import fs from 'fs-extra';
import { type CMsgGCCStrike15_v2_MatchList, CMsgGCCStrike15_v2_MatchListSchema, fromBinary } from 'csgo-protobuf';
import { NoMatchesFound } from './errors/no-matches-found';
import { MatchesInfoFileNotFound } from './errors/matches-info-file-not-found';
import { WriteFileError } from './errors/write-file-error';
import { SteamRestartRequired } from './errors/steam-restart-required';
import { BoilerSteamNotRunning } from './errors/boiler-steam-not-running';
import { SteamCommunicationError } from './errors/steam-communication-error';
import { BoilerUnknownError } from './errors/boiler-unknown-error';
import { isWindows } from 'csdm/node/os/is-windows';
import { killCounterStrikeProcesses } from 'csdm/node/counter-strike/kill-counter-strike-processes';
import { AlreadyConnected } from './errors/already-connected';
import { UserNotConnected } from './errors/user-not-connected';
import { InvalidArgs } from './errors/invalid-args';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { assertSteamIsRunning } from 'csdm/node/counter-strike/launcher/assert-steam-is-running';

type OnSteamIdDetectedCallback = (steamId: string) => void;
type OnExitCallback = (exitCode: number) => void;
type StartBoilerOptions = {
  args?: string[];
  onSteamIdDetected?: OnSteamIdDetectedCallback;
  onExit?: OnExitCallback;
};

export async function startBoiler(options?: StartBoilerOptions): Promise<CMsgGCCStrike15_v2_MatchList> {
  await assertSteamIsRunning();
  await killCounterStrikeProcesses();

  return new Promise((resolve, reject) => {
    const executablePath = path.join(
      getStaticFolderPath(),
      'boiler-writter',
      isWindows ? 'boiler-writter.exe' : 'boiler-writter',
    );
    const matchesInfoFilePath = path.join(getAppFolderPath(), 'matches.info');

    const args = [matchesInfoFilePath];
    if (options?.args) {
      args.push(...options.args);
    }
    const child = execFile(executablePath, args);

    const onSteamIdDetected = options?.onSteamIdDetected;
    if (onSteamIdDetected && child.stdout !== null) {
      child.stdout.on('data', (data: string | Buffer) => {
        if (typeof data === 'string' && data.startsWith('STEAMID:')) {
          const steamId = data.slice(8).trim();
          onSteamIdDetected(steamId);
        }
      });
    }

    child.on('error', async (error) => {
      logger.error('boiler process error');
      logger.error(error);
      await killCounterStrikeProcesses();
    });

    child.on('exit', async (code: number) => {
      if (options?.onExit) {
        options.onExit(code);
      }
      await killCounterStrikeProcesses();

      const exitCodes = {
        Success: 0,
        Error: 1,
        InvalidArgs: 2,
        CommunicationFailure: 3,
        AlreadyConnected: 4,
        SteamRestartRequired: 5,
        SteamNotRunningOrLoggedIn: 6,
        UserNotLoggedIn: 7,
        NoMatchesFound: 8,
        WriteFileFailure: 9,
      } as const;

      switch (code) {
        case exitCodes.Success: {
          const infoFileExits = await fs.pathExists(matchesInfoFilePath);
          if (infoFileExits) {
            const buffer = await fs.readFile(matchesInfoFilePath);
            const bytes = new Uint8Array(buffer);
            const matchListMessage = fromBinary(CMsgGCCStrike15_v2_MatchListSchema, bytes);

            return resolve(matchListMessage);
          }

          return reject(new MatchesInfoFileNotFound());
        }
        case exitCodes.InvalidArgs:
          return reject(new InvalidArgs());
        case exitCodes.CommunicationFailure:
          return reject(new SteamCommunicationError());
        case exitCodes.AlreadyConnected:
          return reject(new AlreadyConnected());
        case exitCodes.SteamRestartRequired:
          return reject(new SteamRestartRequired());
        case exitCodes.SteamNotRunningOrLoggedIn:
          return reject(new BoilerSteamNotRunning());
        case exitCodes.UserNotLoggedIn:
          return reject(new UserNotConnected());
        case exitCodes.NoMatchesFound:
          return reject(new NoMatchesFound());
        case exitCodes.WriteFileFailure:
          return reject(new WriteFileError());
        default:
          return reject(new BoilerUnknownError());
      }
    });
  });
}
