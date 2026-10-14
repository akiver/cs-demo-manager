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
import type { CommandOptions } from 'csdm/cli/parse-command-args';
const streamPipeline = util.promisify(pipeline);

export class DownloadFaceitCommand extends DownloadBaseCommand {
  public static Name = 'dl-faceit';
  public static Description = 'Download the last demos of a FACEIT account.';
  private playerNickname: string | undefined;
  private demoPathBeingDownloaded: string | undefined;
  private readonly options = {
    ...this.outputOption,
    nickname: {
      type: 'string',
      valueName: 'nickname',
      description: 'Nickname of the FACEIT account to download demos from, the current FACEIT account by default.',
    },
  } satisfies CommandOptions;

  public printHelp() {
    this.printCommandHelp({
      name: DownloadFaceitCommand.Name,
      description: DownloadFaceitCommand.Description,
      usages: ['[options]'],
      options: this.options,
      examples: [
        { description: 'Download the last demos of the current FACEIT account', args: '' },
        {
          description: 'Download the demos of a specific account identified by its nickname',
          args: '--nickname "PlayerNickname"',
        },
        {
          description: 'Download demos in a specific folder',
          args: `--output ${this.helpFormatter.formatExamplePath('Downloads')}`,
        },
      ],
    });
  }

  public async run() {
    console.warn(
      `This command is currently disabled, see https://cs-demo-manager.com/docs/guides/downloads#why-faceit-downloads-are-disabled.`,
    );
    return;
    // oxlint-disable no-unreachable
    this.parseArgs();
    process.on('SIGINT', this.onInterruptSignal);

    this.outputFolderPath = await this.getOutputFolder();
    await this.assertOutputFolderIsValid(this.outputFolderPath);
    await this.initDatabaseConnection();
    const accountId = await this.getAccountId();
    const matches = await fetchLastFaceitMatches(accountId);
    console.log(`Found ${matches.length} matches to download.`);
    for (const match of matches) {
      await this.processMatch(match);
    }
    // oxlint-enable no-unreachable
  }

  protected parseArgs() {
    const { values } = this.parseOptions(this.options);
    this.outputFolderPath = values.output ?? '';
    this.playerNickname = values.nickname;
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
