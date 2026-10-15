import fs from 'fs-extra';
import path from 'node:path';
import zlib from 'node:zlib';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { DownloadBaseCommand } from './download-base-command';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { CommandError } from 'csdm/cli/errors/command-error';
import { output } from 'csdm/cli/output';
import { fetchLastRenownMatches } from 'csdm/node/renown/fetch-last-renown-matches';
import { fetchCurrentRenownAccount } from 'csdm/node/database/renown-account/fetch-current-renown-account';
import { fetchRenownAccount } from 'csdm/node/renown/fetch-renown-account-from-steamid';
import type { RenownMatch } from 'csdm/common/types/renown-match';

export class DownloadRenownCommand extends DownloadBaseCommand {
  public static Name = 'dl-renown';
  public static Description = 'Download the last demos of a Renown account.';
  private steamId: string | undefined;
  private readonly options = {
    ...this.downloadOptions,
    steamid: {
      type: 'string',
      valueName: 'steamId',
      description: 'Steam ID of the Renown account to download demos from, the current Renown account by default.',
    },
  } satisfies CommandOptions;

  public printHelp() {
    this.printCommandHelp({
      name: DownloadRenownCommand.Name,
      description: DownloadRenownCommand.Description,
      usages: ['[options]'],
      options: this.options,
      examples: [
        { description: 'Download the last demos of the current Renown account', args: '' },
        {
          description: 'Download the demos of a specific account identified by its Steam ID',
          args: '--steamid 76561198000000000',
        },
        {
          description: 'Download demos in a specific folder',
          args: `--output ${this.helpFormatter.formatExamplePath('Downloads')}`,
        },
      ],
    });
  }

  public async run() {
    this.parseArgs();

    this.outputFolderPath = await this.getOutputFolder();
    await this.assertOutputFolderIsValid(this.outputFolderPath);
    await this.initDatabaseConnection();
    output.progress('Finding account to download matches from...');
    const steamId = await this.getAccountSteamId();
    output.progress('Finding matches to download...');
    const matches = await fetchLastRenownMatches(steamId);
    output.log(`Found ${matches.length} matches to download`);
    await this.processMatches(matches, (match) => this.processMatch(match));
  }

  protected parseArgs() {
    const { values } = this.parseOptions(this.options);
    this.parseDownloadOptions(values);
    this.steamId = values.steamid;
  }

  private async processMatch(match: RenownMatch) {
    const demoPath = path.join(this.outputFolderPath, `${match.id}.dem`);
    const demoAlreadyExists = await fs.pathExists(demoPath);
    if (demoAlreadyExists) {
      this.printDemoAlreadyDownloaded(demoPath);
      return;
    }

    const isLinkExpired = await isDownloadLinkExpired(match.demoUrl);
    if (isLinkExpired) {
      this.printDownloadError(`Demo link expired for match: ${match.id}`, demoPath);
      return;
    }

    await this.downloadDemo(match.demoUrl, demoPath, zlib.createGunzip());
  }

  private async getAccountSteamId() {
    if (!this.steamId) {
      const currentAccount = await fetchCurrentRenownAccount();
      if (!currentAccount) {
        throw new CommandError('No current Renown account found.');
      }

      return currentAccount.id;
    }

    try {
      const account = await fetchRenownAccount(this.steamId);
      return account.steam_id;
    } catch (error) {
      throw new CommandError(`Failed to retrieve account with Steam ID: ${this.steamId}`, { cause: error });
    }
  }
}
