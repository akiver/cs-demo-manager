import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';
import { Command } from './command';
import { type DemoSource, SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import type { Analysis } from 'csdm/common/types/analysis';
import { getErrorCodeMessage } from 'csdm/cli/get-error-code-message';
import { isErrorCode } from 'csdm/common/is-error-code';

export class AnalyzeCommand extends Command {
  public static Name = 'analyze';
  private readonly demoPaths: string[] = [];
  private analyzePositions = false;
  private forceAnalyze = false;
  private source: DemoSource | undefined = undefined;
  private sourceFlag = '--source';
  private forceFlag = '--force';
  private analyzePositionsFlag = '--analyze-positions';

  public getDescription() {
    return 'Analyze and persist demos into the database.';
  }

  public printHelp() {
    const sourceValues = SupportedDemoSources.join(',');
    console.log(this.getDescription());
    console.log('');
    console.log(
      `Usage: csdm ${AnalyzeCommand.Name} demoPaths... ${this.formatFlagsForHelp([this.sourceFlag, this.forceFlag, this.analyzePositionsFlag])}`,
    );
    console.log('');
    console.log('Demos path can be either a .dem files path or a directory. It can be relative or absolute.');
    console.log('');
    console.log(
      `The ${this.sourceFlag} flag forces the analysis logic of the demo analyzer. Available values: [${sourceValues}]`,
    );
    console.log(`The ${this.forceFlag} flag forces demos analyzes even if they are already in the database.`);
    console.log(
      `The ${this.analyzePositionsFlag} flag indicates to includes players,projectiles... positions in the analysis.`,
    );
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
    console.log(
      `    csdm ${AnalyzeCommand.Name} "C:\\Users\\username\\Desktop\\MyFolder" ${this.sourceFlag} esl ${this.forceFlag}`,
    );
  }

  public async run() {
    await this.parseArgs();

    if (this.demoPaths.length === 0) {
      console.log('No demos found');
      this.exitWithFailure();
    }

    await migrateSettings();
    const client = await this.connectToDaemon();

    console.log(`${this.demoPaths.length} demos to process`);

    const pendingChecksums = new Set<string>();
    const lastStatusPerChecksum = new Map<string, AnalysisStatus>();
    let hasError = false;
    let resolveCompletion: () => void;
    const completion = new Promise<void>((resolve) => {
      resolveCompletion = resolve;
    });

    const markAnalysisAsDone = (checksum: string) => {
      pendingChecksums.delete(checksum);
      if (pendingChecksums.size === 0) {
        resolveCompletion();
      }
    };

    const onAnalysisUpdated = (analysis: Analysis) => {
      const { demoChecksum: checksum, demoPath, status } = analysis;
      if (!pendingChecksums.has(checksum) || lastStatusPerChecksum.get(checksum) === status) {
        return;
      }
      lastStatusPerChecksum.set(checksum, status);

      switch (status) {
        case AnalysisStatus.Analyzing:
          console.log(`Analyzing demo ${demoPath}...`);
          break;
        case AnalysisStatus.Inserting:
          console.log(`Inserting match into database ${demoPath}...`);
          break;
        case AnalysisStatus.InsertSuccess:
          console.log(`Demo ${demoPath} inserted into the database`);
          markAnalysisAsDone(checksum);
          break;
        case AnalysisStatus.AnalyzeError:
        case AnalysisStatus.InsertError:
          hasError = true;
          console.error(
            status === AnalysisStatus.AnalyzeError
              ? `Error analyzing demo ${demoPath}`
              : `Error inserting match into database ${demoPath}`,
          );
          if (analysis.output !== '') {
            console.error(analysis.output);
          }
          markAnalysisAsDone(checksum);
          break;
      }
    };

    client.on(ServerPushMessageName.AnalysisUpdated, onAnalysisUpdated);

    const { addedDemos, skippedDemoPaths } = await client.send(
      {
        name: CliClientMessageName.AddDemoPathsToAnalyses,
        payload: {
          demoPaths: this.demoPaths,
          force: this.forceAnalyze,
          analyzePositions: this.analyzePositions,
          source: this.source,
        },
      },
      { timeoutMs: 20_000 },
    );

    for (const demoPath of skippedDemoPaths) {
      console.log(`Demo ${demoPath} already in database, skipping this demo.`);
    }
    for (const { checksum } of addedDemos) {
      pendingChecksums.add(checksum);
    }

    if (pendingChecksums.size > 0) {
      const daemonStatusPollIntervalMs = 30_000;
      // Safety net in case a terminal push message never arrives (e.g. the analysis has been removed from the queue
      // through the GUI). Push messages and the status reply arrive on the same socket, so a non-busy status with
      // pending analyses means they will never complete.
      const pollIntervalId = setInterval(async () => {
        try {
          const daemon = await client.send({ name: CliClientMessageName.GetDaemonStatus });
          if (!daemon.busy && pendingChecksums.size > 0) {
            hasError = true;
            console.error('Some analyses did not complete, check the demos in the GUI or re-run the command.');
            resolveCompletion();
          }
        } catch (error) {
          hasError = true;
          let errorMessage: string;
          if (isErrorCode(error)) {
            errorMessage = getErrorCodeMessage(error);
          } else {
            errorMessage = error instanceof Error ? error.message : 'The daemon is not responding.';
          }
          console.error(errorMessage);
          resolveCompletion();
        }
      }, daemonStatusPollIntervalMs);

      await completion;
      clearInterval(pollIntervalId);
    }

    client.close();

    if (hasError) {
      this.exitWithFailure();
    }
  }

  protected async parseArgs() {
    super.parseArgs(this.args);

    if (this.args.length === 0) {
      console.log('No demo path provided');
      this.printHelp();
      this.exitWithFailure();
    }

    for (let index = 0; index < this.args.length; index++) {
      const arg = this.args[index];
      if (this.isFlagArgument(arg)) {
        switch (arg) {
          case this.analyzePositionsFlag:
            this.analyzePositions = true;
            break;
          case this.forceFlag:
            this.forceAnalyze = true;
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
          default:
            console.log(`Unknown flag: ${arg}`);
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
}
