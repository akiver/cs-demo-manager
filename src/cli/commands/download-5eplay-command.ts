import fs from 'fs-extra';
import unzipper from 'unzipper';
import path from 'node:path';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { DownloadBaseCommand } from './download-base-command';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { CommandError } from 'csdm/cli/errors/command-error';
import { output } from 'csdm/cli/output';
import { fetchCurrent5EPlayAccount } from 'csdm/node/database/5play-account/fetch-current-5eplay-account';
import { fetch5EPlayAccount } from 'csdm/node/5eplay/fetch-5eplay-player-account-from-domain';
import { fetchLast5EPlayMatches } from 'csdm/node/5eplay/fetch-last-5eplay-matches';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';

export class Download5EPlayCommand extends DownloadBaseCommand {
  public static Name = 'dl-5eplay';
  public static Description = 'Download the last demos of a 5EPlay account.';
  private id: string | undefined;
  private readonly options = {
    ...this.downloadOptions,
    id: {
      type: 'string',
      valueName: 'id',
      description: 'ID of the 5EPlay account to download demos from, the current 5EPlay account by default.',
    },
  } satisfies CommandOptions;

  public printHelp() {
    this.printCommandHelp({
      name: Download5EPlayCommand.Name,
      description: Download5EPlayCommand.Description,
      usages: ['[options]'],
      options: this.options,
      examples: [
        { description: 'Download the last demos of the current 5EPlay account', args: '' },
        { description: 'Download the demos of a specific account identified by its ID', args: '--id "myid"' },
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
    const id = await this.getAccountId();
    output.progress('Finding matches to download...');
    const matches = await fetchLast5EPlayMatches(id);
    output.log(`Found ${matches.length} matches to download`);
    await this.processMatches(matches, (match) => this.processMatch(match));
  }

  protected parseArgs() {
    const { values } = this.parseOptions(this.options);
    this.parseDownloadOptions(values);
    this.id = values.id;
  }

  private async processMatch(match: FiveEPlayMatch) {
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

    await this.downloadDemo(match.demoUrl, demoPath, unzipper.ParseOne());
  }

  private async getAccountId() {
    if (!this.id) {
      const currentAccount = await fetchCurrent5EPlayAccount();
      if (!currentAccount) {
        throw new CommandError('No current 5EPlay account found.');
      }

      return currentAccount.domainId;
    }

    try {
      const account = await fetch5EPlayAccount(this.id);
      return account.id;
    } catch (error) {
      throw new CommandError(`Failed to retrieve account with ID: ${this.id}`, { cause: error });
    }
  }
}
