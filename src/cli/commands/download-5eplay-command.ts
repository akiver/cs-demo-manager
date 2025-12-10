import fs from 'fs-extra';
import { request } from 'undici';
import unzipper from 'unzipper';
import { pipeline } from 'node:stream';
import path from 'node:path';
import util from 'node:util';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { DownloadBaseCommand } from './download-base-command';
import { fetchCurrent5EPlayAccount } from 'csdm/node/database/5play-account/fetch-current-5eplay-account';
import { fetch5EPlayAccount } from 'csdm/node/5eplay/fetch-5eplay-player-account-from-domain';
import { fetchLast5EPlayMatches } from 'csdm/node/5eplay/fetch-last-5eplay-matches';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';
const streamPipeline = util.promisify(pipeline);

export class Download5EPlayCommand extends DownloadBaseCommand {
  public static Name = 'dl-5eplay';
  private id: string | undefined;
  private demoPathBeingDownloaded: string | undefined;
  private idFlag = '--id';

  public getDescription() {
    return 'Download the last demos of a 5EPlay account.';
  }

  public printHelp() {
    console.log(this.getDescription());
    console.log('');
    console.log(`Usage: csdm ${Download5EPlayCommand.Name} ${this.formatFlagsForHelp([this.outputFlag, this.idFlag])}`);
    console.log('');
    console.log(`The ${this.outputFlag} flag specify the directory where demos will be downloaded.`);
    console.log(`Default value in order of preference:`);
    console.log('\t1. Download folder specified in the application settings.');
    console.log('\t2. The Counter-Strike folder "replays".');
    console.log('\t3. The current directory.');
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('To download the last 5EPlay demos of the current 5EPlay account:');
    console.log(`    csdm ${Download5EPlayCommand.Name}`);
    console.log('');
    console.log('To download demos of a specific account identified by its ID:');
    console.log(`    csdm ${Download5EPlayCommand.Name} ${this.idFlag} "myid"`);
    console.log('');
    console.log('To change the directory where demos will be downloaded:');
    console.log(`    csdm ${Download5EPlayCommand.Name} ${this.outputFlag} "C:\\Users\\username\\Downloads"`);
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
    console.log('Finding account to download matches from...');
    const id = await this.getAccountId();
    console.log('Finding matches to download...');
    const matches = await fetchLast5EPlayMatches(id);
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
          case this.idFlag:
            if (this.args.length > index + 1) {
              index += 1;
              this.id = this.args[index];
            } else {
              console.log(`Missing ${this.idFlag} value`);
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

  private async processMatch(match: FiveEPlayMatch) {
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
    const transformStream = unzipper.ParseOne();
    await streamPipeline(response.body, transformStream, out);
    this.demoPathBeingDownloaded = undefined;
  }

  private async getAccountId() {
    if (!this.id) {
      const currentAccount = await fetchCurrent5EPlayAccount();
      if (!currentAccount) {
        console.log('No current 5EPlay account found.');
        return this.exitWithFailure();
      }

      return currentAccount.domainId;
    }

    try {
      const account = await fetch5EPlayAccount(this.id);
      return account.id;
    } catch (error) {
      console.error(`Failed to retrieve account with ID: ${this.id}`);
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
