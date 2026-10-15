import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { type DemoSource, SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { Command } from './command';
import { runDemoAnalyzer } from 'csdm/node/demo-analyzer/run-demo-analyzer';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { isPathWritable } from 'csdm/node/filesystem/is-path-writable';
import { processMatchInsertion } from 'csdm/node/database/matches/process-match-insertion';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { CommandError } from 'csdm/cli/errors/command-error';
import { getErrorMessage } from 'csdm/cli/get-error-message';
import { ExitCode } from 'csdm/cli/exit-code';
import { resolveDemoPaths } from 'csdm/cli/resolve-demo-paths';
import { output } from 'csdm/cli/output';

type ExportValues = {
  'output-folder'?: string;
  source?: string;
  'force-analyze'?: boolean;
};

export abstract class ExportCommand extends Command {
  protected readonly demoPaths: string[] = [];
  private forceAnalyze = false;
  private source: DemoSource | undefined = undefined;
  private temporaryFolderPath = path.resolve(os.tmpdir(), 'cs-demo-manager-cli');
  protected outputFolderPath = process.cwd();
  protected demosToExport: {
    checksum: string;
    demoName: string;
  }[] = [];
  protected readonly exportOptions = {
    'output-folder': {
      type: 'string',
      valueName: 'folder',
      description: 'Folder where the files are saved.',
      defaultValue: 'current folder',
    },
    source: {
      type: 'string',
      valueName: 'source',
      choices: SupportedDemoSources,
      description: 'Force the analysis logic of the demo analyzer, detected from the demo by default.',
    },
    'force-analyze': {
      type: 'boolean',
      description: 'Analyze demos even if they are already in the database.',
    },
  } satisfies CommandOptions;

  protected abstract exportMatches(): Promise<void>;

  public async run() {
    if (this.demoPaths.length === 0) {
      throw new CommandError('No demos found');
    }

    await this.assertOutputFolderIsValid();

    await migrateSettings();
    await this.initDatabaseConnection();
    const checksumsInDatabase = await fetchMatchChecksums();

    output.log(`${this.demoPaths.length} demos to process`);
    const failedDemos: { demoPath: string; details: string }[] = [];
    for (const [index, demoPath] of this.demoPaths.entries()) {
      const progressPrefix = `[${index + 1}/${this.demoPaths.length}]`;
      try {
        const checksum = await getDemoChecksumFromDemoPath(demoPath);
        const isDemoAlreadyInDatabase = checksumsInDatabase.includes(checksum);
        if (!isDemoAlreadyInDatabase || this.forceAnalyze) {
          await this.analyzeDemo(demoPath, progressPrefix);
          await this.insertMatchInDatabase(checksum, demoPath, progressPrefix);
        }

        this.demosToExport.push({
          checksum,
          demoName: path.basename(demoPath),
        });
      } catch (error) {
        failedDemos.push({ demoPath, details: getErrorMessage(error) });
        output.error(`Failed to process ${path.basename(demoPath)}`);
      }
    }

    if (this.demosToExport.length === 0) {
      output.failedDemos(failedDemos);
      throw new CommandError('No demos to export');
    }

    await this.exportMatches();
    output.failedDemos(failedDemos);

    if (failedDemos.length > 0) {
      this.markAsFailed();
    }
  }

  protected async parseExportArgs(values: ExportValues, positionals: string[]) {
    if (this.args.length === 0) {
      this.printHelp();
      this.exit(ExitCode.InvalidUsage);
    }
    if (positionals.length === 0) {
      throw new InvalidArgument('Missing demo paths');
    }

    this.demoPaths.push(...(await resolveDemoPaths(positionals)));
    this.outputFolderPath = values['output-folder'] ?? process.cwd();
    this.forceAnalyze = values['force-analyze'] ?? false;
    this.source = values.source as DemoSource | undefined;
  }

  private async assertOutputFolderIsValid() {
    const isOutputFolderExits = await fs.pathExists(this.outputFolderPath);
    if (!isOutputFolderExits) {
      throw new CommandError(`The output folder does not exist: ${this.outputFolderPath}`);
    }

    const isOutputFolderWritable = await isPathWritable(this.outputFolderPath);
    if (!isOutputFolderWritable) {
      throw new CommandError(`The output folder is not writable: ${this.outputFolderPath}`);
    }
  }

  private async analyzeDemo(demoPath: string, progressPrefix: string) {
    let analyzerOutput = '';
    try {
      await runDemoAnalyzer({
        demoPath,
        outputFolderPath: this.temporaryFolderPath,
        analyzePositions: false,
        onStart: () => {
          output.progress(`${progressPrefix} Analyzing ${path.basename(demoPath)}...`);
        },
        onStderr: (data) => {
          analyzerOutput += data;
        },
        source: this.source,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      // The analyzer rejects without error when it exits with a failure code, its output explains why.
      throw new CommandError(`Failed to analyze the demo\n${analyzerOutput}`.trimEnd());
    }
  }

  private async insertMatchInDatabase(checksum: string, demoPath: string, progressPrefix: string) {
    output.progress(`${progressPrefix} Inserting ${path.basename(demoPath)} into the database...`);
    await processMatchInsertion({
      checksum,
      demoPath,
      outputFolderPath: this.temporaryFolderPath,
    });
  }
}
