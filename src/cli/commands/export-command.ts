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
import { resolveDemoPaths } from 'csdm/cli/resolve-demo-paths';

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

  public async run() {
    if (this.demoPaths.length === 0) {
      console.log('No demos found');
      this.exitWithFailure();
    }

    await this.assertOutputFolderIsValid();

    await migrateSettings();
    await this.initDatabaseConnection();
    const checksumsInDatabase = await fetchMatchChecksums();

    console.log(`${this.demoPaths.length} demos to process`);
    for (const demoPath of this.demoPaths) {
      try {
        const checksum = await getDemoChecksumFromDemoPath(demoPath);
        const isDemoAlreadyInDatabase = checksumsInDatabase.includes(checksum);
        if (!isDemoAlreadyInDatabase || this.forceAnalyze) {
          await this.analyzeDemo(demoPath);
          await this.insertMatchInDatabase(checksum, demoPath);
        }

        this.demosToExport.push({
          checksum,
          demoName: path.basename(demoPath),
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      }
    }

    if (this.demosToExport.length === 0) {
      console.log('No demos to export');
      this.exit();
    }
  }

  protected async parseExportArgs(values: ExportValues, positionals: string[]) {
    if (this.args.length === 0) {
      this.printHelp();
      this.exitWithFailure();
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
      console.log(`The output folder does not exist: ${this.outputFolderPath}`);
      this.exitWithFailure();
    }

    const isOutputFolderWritable = await isPathWritable(this.outputFolderPath);
    if (!isOutputFolderWritable) {
      console.log(`The output folder is not writable: ${this.outputFolderPath}`);
      this.exitWithFailure();
    }
  }

  private async analyzeDemo(demoPath: string) {
    await runDemoAnalyzer({
      demoPath,
      outputFolderPath: this.temporaryFolderPath,
      analyzePositions: false,
      onStart: () => {
        console.log(`Analyzing ${demoPath}...`);
      },
      onStderr: (output) => {
        console.error(`Error analyzing demo: ${demoPath}:`);
        console.error(output);
      },
      source: this.source,
    });
  }

  private async insertMatchInDatabase(checksum: string, demoPath: string) {
    console.log(`Inserting match into database: ${demoPath}...`);
    await processMatchInsertion({
      checksum,
      demoPath,
      outputFolderPath: this.temporaryFolderPath,
    });
  }
}
