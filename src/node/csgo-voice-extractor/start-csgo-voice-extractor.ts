import { exec } from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { isMac } from 'csdm/node/os/is-mac';
import { InvalidArgs } from './errors/invalid-args';
import { LoadCsgoLibError } from './errors/load-csgo-lib-error';
import { DemoParsingError } from './errors/demo-parsing-error';
import { UnsupportedAudioCodec } from './errors/unsupported-audio-codec';
import { NoVoiceDataFound } from './errors/no-voice-data-found';
import { AudioDecodingError } from './errors/audio-decoding-error';
import { CreateAudioFileError } from './errors/create-audio-file-error';
import { CsgoVoiceExtractorUnknownError } from './errors/csgo-voice-extractor-unknown-error';
import { DemoNotFound } from 'csdm/node/counter-strike/launcher/errors/demo-not-found';
import { CounterStrikeExecutableNotFound } from '../counter-strike/launcher/errors/counter-strike-executable-not-found';
import { Game } from 'csdm/common/types/counter-strike';
import { BadCpuTypeError } from './errors/bad-cpu-type-error';

async function assertCsgoLibFilesExist(csgoAudioLibsFolderPath: string) {
  let requiredFiles: string[] = [];
  if (isWindows) {
    requiredFiles = ['vaudio_celt.dll', 'tier0.dll'];
  } else if (isMac) {
    requiredFiles = ['vaudio_celt.dylib', 'libtier0.dylib', 'libvstdlib.dylib'];
  } else {
    requiredFiles = ['vaudio_celt_client.so', 'libtier0_client.so'];
  }

  for (const fileName of requiredFiles) {
    const fileExists = await fs.pathExists(path.resolve(csgoAudioLibsFolderPath, fileName));
    if (!fileExists) {
      throw new CounterStrikeExecutableNotFound(Game.CSGO);
    }
  }
}

export async function startCsgoVoiceExtractor(demoPath: string, outputFolderPath: string) {
  const csgoLibFolderPath = path.join(getStaticFolderPath(), 'csgove');
  await assertCsgoLibFilesExist(csgoLibFolderPath);

  await fs.mkdirp(outputFolderPath);

  return new Promise<void>((resolve, reject) => {
    const executablePath = path.join(csgoLibFolderPath, isWindows ? 'csgove.exe' : 'csgove');
    const args = [executablePath, '-exit-on-first-error', `-output="${outputFolderPath}"`, `"${demoPath}"`];
    const command = args.join(' ');
    const libraryPathVarName = isMac ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH';

    logger.log('Starting csgo-voice-extractor with command:', command);
    const extractorProcess = exec(command, {
      windowsHide: true,
      env: {
        ...process.env,
        [libraryPathVarName]: csgoLibFolderPath,
      },
    });

    extractorProcess.stdout?.on('data', logger.log);
    extractorProcess.stderr?.on('data', (error) => {
      logger.error(error);

      // Happens on macOS ARM64 when trying to run a x86 binary without Rosetta installed
      if (String(error).includes('Bad CPU type')) {
        return reject(new BadCpuTypeError());
      }
    });

    extractorProcess.on('exit', (code: number) => {
      logger.log('CSGO voice extractor exited with code:', code);
      const exitCodes = {
        InvalidArguments: 10,
        LoadCsgoLibError: 11,
        DemoNotFound: 12,
        ParsingError: 13,
        UnsupportedAudioCodec: 14,
        NoVoiceDataFound: 15,
        DecodingError: 16,
        WavFileCreationError: 17,
      } as const;

      switch (code) {
        case 0:
          return resolve();
        case exitCodes.InvalidArguments:
          return reject(new InvalidArgs());
        case exitCodes.LoadCsgoLibError:
          return reject(new LoadCsgoLibError());
        case exitCodes.DemoNotFound:
          return reject(new DemoNotFound());
        case exitCodes.ParsingError:
          return reject(new DemoParsingError());
        case exitCodes.UnsupportedAudioCodec:
          return reject(new UnsupportedAudioCodec());
        case exitCodes.NoVoiceDataFound:
          return reject(new NoVoiceDataFound());
        case exitCodes.DecodingError:
          return reject(new AudioDecodingError());
        case exitCodes.WavFileCreationError:
          return reject(new CreateAudioFileError());
        default:
          return reject(new CsgoVoiceExtractorUnknownError());
      }
    });
  });
}
