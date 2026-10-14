import fs from 'fs-extra';
import { request } from 'undici';
import { pipeline } from 'node:stream';
import path from 'node:path';
import zlib from 'node:zlib';
import util from 'node:util';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { DownloadBaseCommand } from './download-base-command';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { fetchLastRenownMatches } from 'csdm/node/renown/fetch-last-renown-matches';
import { fetchCurrentRenownAccount } from 'csdm/node/database/renown-account/fetch-current-renown-account';
import { fetchRenownAccount } from 'csdm/node/renown/fetch-renown-account-from-steamid';
import type { RenownMatch } from 'csdm/common/types/renown-match';
const streamPipeline = util.promisify(pipeline);

export class DownloadRenownCommand extends DownloadBaseCommand {
  public static Name = 'dl-renown';
  public static Description = 'Download the last demos of a Renown account.';
  private steamId: string | undefined;
  private demoPathBeingDownloaded: string | undefined;
  private readonly options = {
    ...this.outputOption,
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
    process.on('SIGINT', this.onInterruptSignal);

    this.outputFolderPath = await this.getOutputFolder();
    await this.assertOutputFolderIsValid(this.outputFolderPath);
    await this.initDatabaseConnection();
    console.log('Finding account to download matches from...');
    const steamId = await this.getAccountSteamId();
    console.log('Finding matches to download...');
    const matches = await fetchLastRenownMatches(steamId);
    console.log(`Found ${matches.length} matches to download.`);
    for (const match of matches) {
      await this.processMatch(match);
    }
  }

  protected parseArgs() {
    const { values } = this.parseOptions(this.options);
    this.outputFolderPath = values.output ?? '';
    this.steamId = values.steamid;
  }

  private async processMatch(match: RenownMatch) {
    const demoPath = path.join(this.outputFolderPath, `${match.id}.dem`);
    const demoAlreadyExists = await fs.pathExists(demoPath);
    if (demoAlreadyExists) {
      console.log('Demo already in the download folder.');
      return;
    }

    const isLinkExpired = await isDownloadLinkExpired(match.demoUrl);
    if (isLinkExpired) {
      console.log(`Demo link expired for match: ${match.id}`);
      return;
    }

    console.log(`Downloading ${match.demoUrl}...`);
    this.demoPathBeingDownloaded = demoPath;
    const response = await request(match.demoUrl, { method: 'GET' });
    if (!response.body) {
      console.log('Request error.');
      return;
    }

    const out = fs.createWriteStream(demoPath);
    const transformStream = zlib.createGunzip();
    await streamPipeline(response.body, transformStream, out);
    this.demoPathBeingDownloaded = undefined;
  }

  private async getAccountSteamId() {
    if (!this.steamId) {
      const currentAccount = await fetchCurrentRenownAccount();
      if (!currentAccount) {
        console.log('No current Renown account found.');
        return this.exitWithFailure();
      }

      return currentAccount.id;
    }

    try {
      const account = await fetchRenownAccount(this.steamId);
      return account.steam_id;
    } catch (error) {
      console.error(`Failed to retrieve account with Steam ID: ${this.steamId}`);
      return this.exitWithFailure();
    }
  }

  private onInterruptSignal = async () => {
    if (this.demoPathBeingDownloaded) {
      await fs.remove(this.demoPathBeingDownloaded);
    }
    this.exit();
  };
}
