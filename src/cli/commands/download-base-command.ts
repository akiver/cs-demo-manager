import fs from 'fs-extra';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { Command } from './command';
import {
  getDefaultCs2Folders,
  getDefaultCsgoFolders,
} from 'csdm/node/counter-strike/get-default-counter-strike-folders';
import { isPathWritable } from 'csdm/node/filesystem/is-path-writable';

export abstract class DownloadBaseCommand extends Command {
  protected outputFolderPath = '';
  protected outputFlag = '--output';

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
      console.log(`The output folder does not exist: ${outputFolderPath}`);
      this.exitWithFailure();
    }

    const isOutputFolderWritable = await isPathWritable(outputFolderPath);
    if (!isOutputFolderWritable) {
      console.log(`The output folder is not writable: ${outputFolderPath}`);
      this.exitWithFailure();
    }
  }
}
