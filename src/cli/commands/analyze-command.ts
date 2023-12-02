import fs from 'fs-extra';
import glob from 'tiny-glob';
import path from 'node:path';
import os from 'node:os';
import { Command } from './command';
import { type DemoSource, SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { runDemoAnalyzer } from 'csdm/node/demo-analyzer/run-demo-analyzer';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { processMatchInsertion } from 'csdm/node/database/matches/process-match-insertion';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';

export class AnalyzeCommand extends Command {
  public static Name = 'analyze';
  private readonly demoPaths: string[] = [];
  private analyzePositions = false;
  private forceAnalyze = false;
  private source: DemoSource | undefined = undefined;
  private temporaryFolderPath = path.resolve(os.tmpdir(), 'cs-demo-manager-cli');

  public getDescription() {
    return 'Analyze and persist demos into the database.';
  }

  public printHelp() {
    const sourceValues = SupportedDemoSources.join(',');
    console.log(this.getDescription());
    console.log('');
    console.log(`Usage: csdm ${AnalyzeCommand.Name} demoPaths... [--source] [--force]`);
    console.log('');
    console.log('Demos path can be either a .dem files path or a directory. It can be relative or absolute.');
    console.log(
      `The --source argument force the analysis logic of the demo analyzer. Available values: [${sourceValues}]`,
    );
    console.log('The --force argument force demos analyzes even if they are already in the database.');
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('Analyze 1 demo:');
    console.log(`    csdm ${AnalyzeCommand.Name} "C:\\Users\\username\\Desktop\\demo.dem"`);
    console.log('');
    console.log('Analyze multiple demos:');
    console.log(
      `    csdm ${AnalyzeCommand.Name} "C:\\Users\\username\\Desktop\\demo.dem" "C:\\Users\\username\\Desktop\\demo2.dem"`,
    );
    console.log('');
    console.log(
      'Analyze all demos in a directory using the ESL analyzer and re-analyze demos that have already been analyzed:',
    );
    console.log(`    csdm ${AnalyzeCommand.Name} "C:\\Users\\username\\Desktop\\MyFolder" --source esl --force`);
  }

  public async run() {
    await this.parseArgs();

    if (this.demoPaths.length === 0) {
      console.log('No demos found');
      this.exitWithFailure();
    }

    await migrateSettings();
    await this.initDatabaseConnection();
    const checksums = await fetchMatchChecksums();
    console.log(`${this.demoPaths.length} demos to process`);
    for (const demoPath of this.demoPaths) {
      try {
        const checksum = await getDemoChecksumFromDemoPath(demoPath);
        const isDemoAlreadyInDatabase = checksums.includes(checksum);
        if (!isDemoAlreadyInDatabase || this.forceAnalyze) {
          await this.analyzeDemo(demoPath);
          console.log(`Inserting match into database ${demoPath}...`);
          await processMatchInsertion({
            checksum,
            demoPath,
            outputFolderPath: this.temporaryFolderPath,
          });
        } else {
          console.log(`Demo ${demoPath} already in database, skipping this demo.`);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      }
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
          case '--analyze-positions':
            this.analyzePositions = true;
            break;
          case '--force':
            this.forceAnalyze = true;
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
              absolute: true,
              filesOnly: true,
              cwd: arg,
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

  private async analyzeDemo(demoPath: string) {
    await runDemoAnalyzer({
      demoPath,
      outputFolderPath: this.temporaryFolderPath,
      analyzePositions: this.analyzePositions,
      onStart: () => {
        console.log(`Analyzing demo ${demoPath}...`);
      },
      onStderr: (output) => {
        console.error(`Error analyzing demo: ${demoPath}:`);
        console.error(output);
      },
      source: this.source,
    });
  }
}
