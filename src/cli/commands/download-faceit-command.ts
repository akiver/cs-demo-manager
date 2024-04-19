import fs from 'fs-extra';
import { request } from 'undici';
import { pipeline } from 'node:stream';
import path from 'node:path';
import zlib from 'node:zlib';
import util from 'node:util';
import { fetchCurrentFaceitAccount } from 'csdm/node/database/faceit-account/fetch-current-faceit-account';
import { fetchLastFaceitMatches } from 'csdm/node/faceit/fetch-last-faceit-matches';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { fetchFaceitAccount } from 'csdm/node/faceit-web-api/fetch-faceit-account';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import { DownloadBaseCommand } from './download-base-command';
const streamPipeline = util.promisify(pipeline);

export class DownloadFaceitCommand extends DownloadBaseCommand {
  public static Name = 'dl-faceit';
  private playerNickname: string | undefined;
  private demoPathBeingDownloaded: string | undefined;
  private nicknameFlag = '--nickname';

  public getDescription() {
    return 'Download the last demos of a FACEIT account.';
  }

  public printHelp() {
    console.log(this.getDescription());
    console.log('');
    console.log(
      `Usage: csdm ${DownloadFaceitCommand.Name} ${this.formatFlagsForHelp([this.outputFlag, this.nicknameFlag])}`,
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
    console.log('To download the last FACEIT demos of the current FACEIT account:');
    console.log(`    csdm ${DownloadFaceitCommand.Name}`);
    console.log('');
    console.log('To download demos of a specific account identified by its nickname:');
    console.log(`    csdm ${DownloadFaceitCommand.Name} ${this.nicknameFlag} "PlayerNickname"`);
    console.log('');
    console.log('To change the directory where demos will be downloaded:');
    console.log(`    csdm ${DownloadFaceitCommand.Name} ${this.outputFlag} "C:\\Users\\username\\Downloads"`);
  }

  public constructor(args: string[]) {
    super(args);
    process.on('SIGINT', this.onInterruptSignal);
  }

  public async run() {
    console.warn(
      `This command is currently disabled, see https://cs-demo-manager.com/docs/guides/downloads#why-faceit-downloads-are-disabled.`,
    );
    return;
    this.parseArgs();

    this.outputFolderPath = await this.getOutputFolder();
    await this.assertOutputFolderIsValid(this.outputFolderPath);
    await this.initDatabaseConnection();
    const accountId = await this.getAccountId();
    const matches = await fetchLastFaceitMatches(accountId);
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
          case this.nicknameFlag:
            if (this.args.length > index + 1) {
              index += 1;
              this.playerNickname = this.args[index];
            } else {
              console.log(`Missing ${this.nicknameFlag} value`);
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

  private async processMatch(match: FaceitMatch) {
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

  private async getAccountId() {
    if (this.playerNickname === undefined) {
      const currentAccount = await fetchCurrentFaceitAccount();
      if (currentAccount === undefined) {
        console.log('No current FACEIT account found.');
        return this.exitWithFailure();
      }

      return currentAccount.id;
    }

    try {
      const account = await fetchFaceitAccount(this.playerNickname);
      return account.player_id;
    } catch (error) {
      console.error(`Failed to retrieve account with nickname: ${this.playerNickname}`);
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
