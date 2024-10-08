import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { glob } from 'csdm/node/filesystem/glob';
import { type DemoSource, SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { Command } from './command';
import { runDemoAnalyzer } from 'csdm/node/demo-analyzer/run-demo-analyzer';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { isPathWritable } from 'csdm/node/filesystem/is-path-writable';
import { processMatchInsertion } from 'csdm/node/database/matches/process-match-insertion';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';

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
  protected readonly forceAnalyzeFlag = '--force-analyze';
  protected readonly outputFolderFlag = '--output-folder';
  protected readonly sourceFlag = '--source';
  protected readonly commonFlags = [this.forceAnalyzeFlag, this.outputFolderFlag, this.sourceFlag];

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

  protected async parseArgs() {
    super.parseArgs(this.args);

    if (this.args.length === 0) {
      console.log('No demo path provided');
      this.printHelp();
      this.exitWithFailure();
    }

    let hasFlag = false;
    for (let index = 0; index < this.args.length; index++) {
      const arg = this.args[index];
      if (this.isFlagArgument(arg)) {
        hasFlag = true;

        switch (arg) {
          case this.forceAnalyzeFlag:
            this.forceAnalyze = true;
            break;
          case this.outputFolderFlag:
            if (this.args.length > index + 1) {
              index += 1;
              this.outputFolderPath = this.args[index];
            } else {
              console.log(`Missing ${this.outputFolderFlag} value`);
              this.exitWithFailure();
            }
            break;
          case this.sourceFlag:
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
              console.log(`Missing ${this.sourceFlag} value`);
              this.exitWithFailure();
            }
            break;
        }
      } else if (!hasFlag) {
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

  protected isCommonFlag(flag: string) {
    return this.commonFlags.includes(flag);
  }
}
