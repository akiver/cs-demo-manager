import fs from 'fs-extra';
import { request } from 'undici';
import { pipeline } from 'node:stream';
import path from 'node:path';
import zlib from 'node:zlib';
import util from 'node:util';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { DownloadBaseCommand } from './download-base-command';
import { fetchLastRenownMatches } from 'csdm/node/renown/fetch-last-renown-matches';
import { fetchCurrentRenownAccount } from 'csdm/node/database/renown-account/fetch-current-renown-account';
import { fetchRenownAccount } from 'csdm/node/renown/fetch-renown-account-from-steamid';
import type { RenownMatch } from 'csdm/common/types/renown-match';
const streamPipeline = util.promisify(pipeline);

export class DownloadRenownCommand extends DownloadBaseCommand {
  public static Name = 'dl-renown';
  private steamId: string | undefined;
  private demoPathBeingDownloaded: string | undefined;
  private steamIdFlag = '--steamid';

  public getDescription() {
    return 'Download the last demos of a Renown account.';
  }

  public printHelp() {
    console.log(this.getDescription());
    console.log('');
    console.log(
      `Usage: csdm ${DownloadRenownCommand.Name} ${this.formatFlagsForHelp([this.outputFlag, this.steamIdFlag])}`,
    );
    console.log('');
    console.log(`The ${this.outputFlag} flag specify the directory where demos will be downloaded.`);
    console.log(`Default value in order of preference:`);
    console.log('\t1. Download folder specified in the application settings.');
    console.log('\t2. The Counter-Strike folder "replays".');
    console.log('\t3. The current directory.');
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('To download the last Renown demos of the current Renown account:');
    console.log(`    csdm ${DownloadRenownCommand.Name}`);
    console.log('');
    console.log('To download demos of a specific account identified by its Steam ID:');
    console.log(`    csdm ${DownloadRenownCommand.Name} ${this.steamIdFlag} 76561198000000000`);
    console.log('');
    console.log('To change the directory where demos will be downloaded:');
    console.log(`    csdm ${DownloadRenownCommand.Name} ${this.outputFlag} "C:\\Users\\username\\Downloads"`);
  }

  public constructor(args: string[]) {
    super(args);
    process.on('SIGINT', this.onInterruptSignal);
  }

  public async run() {
    this.parseArgs();

    this.outputFolderPath = await this.getOutputFolder();
    await this.assertOutputFolderIsValid(this.outputFolderPath);
    await this.initDatabaseConnection();
    const steamId = await this.getAccountSteamId();
    const matches = await fetchLastRenownMatches(steamId);
    console.log(`Found ${matches.length} matches to download.`);
    for (const match of matches) {
      await this.processMatch(match);
    }
  }

  protected parseArgs() {
    super.parseArgs(this.args);

    for (let index = 0; index < this.args.length; index++) {
      const arg = this.args[index];
      if (this.isFlagArgument(arg)) {
        switch (arg) {
          case this.outputFlag:
            if (this.args.length > index + 1) {
              index += 1;
              this.outputFolderPath = this.args[index];
            } else {
              console.log(`Missing ${this.outputFlag} value`);
              this.exitWithFailure();
            }
            break;
          case this.steamIdFlag:
            if (this.args.length > index + 1) {
              index += 1;
              this.steamId = this.args[index];
            } else {
              console.log(`Missing ${this.steamIdFlag} value`);
              this.exitWithFailure();
            }
            break;
          default:
            console.log(`Unknown flag: ${arg}`);
            this.exitWithFailure();
        }
      } else {
        console.log(`Unknown argument: ${arg}`);
        this.exitWithFailure();
      }
    }
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
