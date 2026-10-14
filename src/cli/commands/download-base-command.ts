import fs from 'fs-extra';
import { pipeline } from 'node:stream/promises';
import { Agent, interceptors, request } from 'undici';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { Command } from './command';
import {
  getDefaultCs2Folders,
  getDefaultCsgoFolders,
} from 'csdm/node/counter-strike/get-default-counter-strike-folders';
import { isPathWritable } from 'csdm/node/filesystem/is-path-writable';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { CommandError } from 'csdm/cli/errors/command-error';
import { ExitCode } from 'csdm/cli/exit-code';
import { getErrorMessage } from 'csdm/cli/get-error-message';

export abstract class DownloadBaseCommand extends Command {
  protected outputFolderPath = '';
  private hasDownloadError = false;
  protected readonly outputOption = {
    output: {
      type: 'string',
      valueName: 'folder',
      description:
        'Folder where demos are downloaded. Defaults to the download folder from the app settings, then the Counter-Strike "replays" folder, then the current folder.',
    },
  } satisfies CommandOptions;

  protected async getOutputFolder() {
    if (this.outputFolderPath !== '') {
      return this.outputFolderPath;
    }

    const { download } = await migrateSettings();
    if (download.folderPath) {
      return download.folderPath;
    }

    let defaultFolders = await getDefaultCs2Folders();
    if (defaultFolders.length !== 2) {
      defaultFolders = await getDefaultCsgoFolders();
    }

    if (defaultFolders.length === 2) {
      return defaultFolders[1]; // replays folder
    }

    return process.cwd();
  }

  protected async assertOutputFolderIsValid(outputFolderPath: string) {
    const isOutputFolderExits = await fs.pathExists(outputFolderPath);
    if (!isOutputFolderExits) {
      throw new CommandError(`The output folder does not exist: ${outputFolderPath}`);
    }

    const isOutputFolderWritable = await isPathWritable(outputFolderPath);
    if (!isOutputFolderWritable) {
      throw new CommandError(`The output folder is not writable: ${outputFolderPath}`);
    }
  }

  protected printDownloadError(message: string) {
    this.hasDownloadError = true;
    console.error(message);
  }

  protected async downloadDemo(demoUrl: string, demoPath: string, decompressStream: NodeJS.ReadWriteStream) {
    try {
      // Download links may redirect to a CDN.
      const dispatcher = new Agent().compose(interceptors.redirect({ maxRedirections: 1 }));
      const response = await request(demoUrl, { method: 'GET', dispatcher });
      if (response.statusCode !== 200) {
        await response.body.dump(); // Consume the body to release the connection.
        this.printDownloadError(
          `Failed to download ${demoUrl}, the server responded with the status ${response.statusCode}`,
        );
        return false;
      }

      await pipeline(response.body, decompressStream, fs.createWriteStream(demoPath));

      return true;
    } catch (error) {
      await fs.remove(demoPath);
      this.printDownloadError(`Failed to download ${demoUrl}\n${getErrorMessage(error)}`);
      return false;
    }
  }

  protected exitIfDownloadFailed() {
    if (this.hasDownloadError) {
      this.exit(ExitCode.Failure);
    }
  }
}
