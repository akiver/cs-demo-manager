import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'node:path';
import os from 'node:os';
import { type DemoSource, SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { Command } from './command';
import { runDemoAnalyzer } from 'csdm/node/demo-analyzer/run-demo-analyzer';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { exportMatchesToJson } from 'csdm/node/match/export-matches-to-json';
import { isPathWritable } from 'csdm/node/filesystem/is-path-writable';
import { processMatchInsertion } from 'csdm/node/database/matches/process-match-insertion';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';

export class JsonCommand extends Command {
  public static Name = 'json';
  private readonly demoPaths: string[] = [];
  private forceAnalyze = false;
  private source: DemoSource | undefined = undefined;
  private temporaryFolderPath = path.resolve(os.tmpdir(), 'cs-demo-manager-cli');
  private outputFolderPath = process.cwd();

  public getDescription() {
    return 'Export demos into JSON files.';
  }

  public printHelp() {
    const sourceValues = SupportedDemoSources.join(',');
    console.log(this.getDescription());
    console.log('');
    console.log(`Usage: csdm ${JsonCommand.Name} demoPaths... [--output-folder] [--source] [--force-analyze]`);
    console.log('');
    console.log('Demos path can be either a .dem files path or a directory. It can be relative or absolute.');
    console.log('The --output-folder argument specify the directory where output files will be saved.');
    console.log(
      `The --source argument force the analysis logic of the demo analyzer. Available values: [${sourceValues}]`,
    );
    console.log('The --force-analyze argument force demos analyzes even if they are already in the database.');
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('Export 1 demo:');
    console.log(`    csdm ${JsonCommand.Name} "C:\\Users\\username\\Desktop\\demo.dem"`);
    console.log('');
    console.log('Export all demos in a directory using the ESL analyzer and save it in a custom directory:');
    console.log(
      `    csdm ${JsonCommand.Name} "C:\\Users\\username\\Desktop\\MyFolder" --output-folder "C:\\Users\\username\\Documents" --source esl`,
    );
  }

  public async run() {
    await this.parseArgs();

    if (this.demoPaths.length === 0) {
      console.log('No demos found');
      this.exitWithFailure();
    }

    await this.assertOutputFolderIsValid();

    await migrateSettings();
    await this.initDatabaseConnection();
    const checksumsInDatabase = await fetchMatchChecksums();
    const demosToExport: {
      checksum: string;
      demoName: string;
    }[] = [];

    console.log(`${this.demoPaths.length} demos to process`);
    for (const demoPath of this.demoPaths) {
      try {
        const checksum = await getDemoChecksumFromDemoPath(demoPath);
        const isDemoAlreadyInDatabase = checksumsInDatabase.includes(checksum);
        if (!isDemoAlreadyInDatabase || this.forceAnalyze) {
          await this.analyzeDemo(demoPath);
          await this.insertMatchInDatabase(checksum, demoPath);
        }

        demosToExport.push({
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

    if (demosToExport.length === 0) {
      console.log('No demos to export');
      this.exit();
    }

    const checksums = demosToExport.map((demo) => demo.checksum);
    const options = {
      outputFolderPath: this.outputFolderPath,
      checksums: checksums,
      minify: false,
    };
    try {
      await exportMatchesToJson(options);
      console.log(`Exported ${demosToExport.length} matches in folder ${this.outputFolderPath}`);
    } catch (error) {
      console.log('Error while exporting matches to JSON');
    }
  }

  protected async parseArgs() {
    super.parseArgs(this.args);

    if (this.args.length === 0) {
      console.log('No demo path provided');
      this.exitWithFailure();
    }

    for (let index = 0; index < this.args.length; index++) {
      const arg = this.args[index];
      const isOption = arg.startsWith('--');
      if (isOption) {
        switch (arg) {
          case '--force-analyze':
            this.forceAnalyze = true;
            break;
          case '--output-folder':
            if (this.args.length > index + 1) {
              index += 1;
              this.outputFolderPath = this.args[index];
            } else {
              console.log('Missing --output-folder option value');
              this.exitWithFailure();
            }
            break;
          case '--source':
            if (this.args.length > index + 1) {
              index += 1;
              const source = this.args[index] as DemoSource;
              const isValidSource = SupportedDemoSources.includes(source);
              if (!isValidSource) {
                console.log(`Invalid source ${source}`);
                this.exitWithFailure();
              }
              this.source = source;
            } else {
              console.log('Missing --source option value');
              this.exitWithFailure();
            }
            break;
          default:
            console.log(`Unknown option: ${arg}`);
            this.exitWithFailure();
        }
      } else {
        try {
          const stats = await fs.stat(arg);
          if (stats.isDirectory()) {
            const files = await glob('*.dem', {
              cwd: arg,
              absolute: true,
            });
            this.demoPaths.push(...files);
          } else if (stats.isFile() && arg.endsWith('.dem')) {
            this.demoPaths.push(arg);
          } else {
            console.log(`Invalid path: ${arg}`);
            this.exitWithFailure();
          }
        } catch (error) {
          console.log(`Invalid path: ${arg}`);
          this.exitWithFailure();
        }
      }
    }
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
