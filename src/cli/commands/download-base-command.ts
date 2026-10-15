import fs from 'fs-extra';
import path from 'node:path';
import { Transform } from 'node:stream';
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
import { output } from 'csdm/cli/output';
import { formatBytes } from 'csdm/cli/format';

export abstract class DownloadBaseCommand extends Command {
  protected outputFolderPath = '';
  private isJsonOutput = false;
  private readonly downloadedDemos: { demoPath: string; url: string }[] = [];
  private readonly skippedDemoPaths: string[] = [];
  // The demo path is unknown when the match could not be retrieved, e.g. an expired share code.
  private readonly failedDownloads: { demoPath?: string; error: string }[] = [];
  // Position of the match being processed, such as "[2/10]".
  private progressPrefix = '';
  // Removed when the command is interrupted so that no partial demo is left.
  private demoPathBeingDownloaded: string | undefined;
  // Shared by the downloads to reuse the connections, download links may redirect to a CDN.
  private readonly dispatcher = new Agent().compose(interceptors.redirect({ maxRedirections: 1 }));
  protected readonly downloadOptions = {
    output: {
      type: 'string',
      valueName: 'folder',
      description:
        'Folder where demos are downloaded. Defaults to the download folder from the app settings, then the Counter-Strike "replays" folder, then the current folder.',
    },
    ...this.jsonOption,
  } satisfies CommandOptions;

  protected parseDownloadOptions(values: { output?: string; json?: boolean }) {
    this.outputFolderPath = values.output ?? '';
    this.isJsonOutput = values.json ?? false;
    if (this.isJsonOutput) {
      output.enableJsonMode();
    }
  }

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

  /**
   * Processes the matches one by one, then prints the summary, the JSON result if requested and exits with a failure
   * code if a download failed.
   */
  protected async processMatches<Match>(matches: Match[], processMatch: (match: Match) => Promise<void>) {
    process.on('SIGINT', this.onInterruptSignal);
    for (const [index, match] of matches.entries()) {
      this.progressPrefix = `[${index + 1}/${matches.length}]`;
      await processMatch(match);
    }
    this.progressPrefix = '';

    output.summary({
      succeeded: this.downloadedDemos.length,
      label: 'downloaded',
      skipped: this.skippedDemoPaths.length,
      failed: this.failedDownloads.length,
    });

    if (this.isJsonOutput) {
      output.json({
        downloaded: this.downloadedDemos,
        skipped: this.skippedDemoPaths.map((demoPath) => ({ demoPath })),
        failed: this.failedDownloads,
      });
    }

    if (this.failedDownloads.length > 0) {
      this.markAsFailed();
    }
  }

  protected printProgress(message: string) {
    output.progress(this.withProgressPrefix(message));
  }

  protected printDemoAlreadyDownloaded(demoPath: string) {
    this.skippedDemoPaths.push(demoPath);
    this.printProgress(`${path.basename(demoPath)} already in the download folder`);
  }

  protected printDownloadError(message: string, demoPath?: string) {
    this.failedDownloads.push({ demoPath, error: message });
    output.error(this.withProgressPrefix(message));
  }

  protected async downloadDemo(demoUrl: string, demoPath: string, decompressStream: NodeJS.ReadWriteStream) {
    const demoName = path.basename(demoPath);
    this.printProgress(`Downloading ${demoName}...`);
    this.demoPathBeingDownloaded = demoPath;
    try {
      const response = await request(demoUrl, { method: 'GET', dispatcher: this.dispatcher });
      if (response.statusCode !== 200) {
        await response.body.dump(); // Consume the body to release the connection.
        this.printDownloadError(
          `Failed to download ${demoUrl}, the server responded with the status ${response.statusCode}`,
          demoPath,
        );
        return false;
      }

      const contentLength = Number(response.headers['content-length']);
      const totalBytes = Number.isFinite(contentLength) && contentLength > 0 ? contentLength : undefined;
      let downloadedBytes = 0;
      let lastRenderTime = 0;
      const trackProgress = new Transform({
        transform: (chunk: Buffer, encoding, callback) => {
          downloadedBytes += chunk.length;
          // Throttled, chunks arrive much more often than the terminal needs to be refreshed.
          const now = Date.now();
          if (now - lastRenderTime >= 100) {
            lastRenderTime = now;
            this.printLiveDownloadProgress(demoName, downloadedBytes, totalBytes);
          }
          callback(null, chunk);
        },
      });
      await pipeline(response.body, trackProgress, decompressStream, fs.createWriteStream(demoPath));
      this.downloadedDemos.push({ demoPath, url: demoUrl });
      this.printProgress(`${demoName} downloaded`);

      return true;
    } catch (error) {
      await fs.remove(demoPath);
      this.printDownloadError(`Failed to download ${demoUrl}\n${getErrorMessage(error)}`, demoPath);
      return false;
    } finally {
      this.demoPathBeingDownloaded = undefined;
    }
  }

  private printLiveDownloadProgress(demoName: string, downloadedBytes: number, totalBytes: number | undefined) {
    const progress =
      totalBytes === undefined
        ? formatBytes(downloadedBytes)
        : `${Math.floor((downloadedBytes / totalBytes) * 100)}% (${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)})`;
    output.liveProgress(this.withProgressPrefix(`Downloading ${demoName} ${progress}`));
  }

  private onInterruptSignal = async () => {
    if (this.demoPathBeingDownloaded !== undefined) {
      await fs.remove(this.demoPathBeingDownloaded);
    }
    this.exit(ExitCode.Interrupted);
  };

  private withProgressPrefix(message: string) {
    return this.progressPrefix === '' ? message : `${this.progressPrefix} ${message}`;
  }
}
