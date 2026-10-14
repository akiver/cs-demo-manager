import { Command } from './command';
import { type DemoSource, SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import type { Analysis } from 'csdm/common/types/analysis';
import { getErrorCodeMessage } from 'csdm/cli/get-error-code-message';
import { isErrorCode } from 'csdm/common/is-error-code';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { resolveDemoPaths } from 'csdm/cli/resolve-demo-paths';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';

export class AnalyzeCommand extends Command {
  public static Name = 'analyze';
  public static Description = 'Analyze and persist demos into the database.';
  private readonly options = {
    source: {
      type: 'string',
      valueName: 'source',
      choices: SupportedDemoSources,
      description: 'Force the analysis logic of the demo analyzer, detected from the demo by default.',
    },
    force: {
      type: 'boolean',
      description: 'Analyze demos even if they are already in the database.',
    },
    'analyze-positions': {
      type: 'boolean',
      description: 'Include the players, grenades... positions in the analysis.',
    },
  } satisfies CommandOptions;
  private demoPaths: string[] = [];
  private analyzePositions = false;
  private forceAnalyze = false;
  private source: DemoSource | undefined = undefined;

  public printHelp() {
    this.printCommandHelp({
      name: AnalyzeCommand.Name,
      description: AnalyzeCommand.Description,
      usages: ['<demo-paths...> [options]'],
      arguments: [
        {
          label: '<demo-paths...>',
          description: '.dem files or folders containing .dem files, relative or absolute.',
        },
      ],
      options: this.options,
      examples: [
        { description: 'Analyze 1 demo', args: this.helpFormatter.formatExamplePath('Desktop', 'demo.dem') },
        {
          description: 'Analyze multiple demos',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'demo.dem')} ${this.helpFormatter.formatExamplePath('Desktop', 'demo2.dem')}`,
        },
        {
          description: 'Analyze all demos in a folder with the ESL analyzer, including the ones already analyzed',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'MyFolder')} --source esl --force`,
        },
      ],
    });
  }

  public async run() {
    await this.parseArgs();

    if (this.demoPaths.length === 0) {
      console.log('No demos found');
      this.exitWithFailure();
    }

    await migrateSettings();
    const client = await this.connectToDaemon();
    await this.ensureDaemonDatabaseConnection(client);

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
    if (this.args.length === 0) {
      this.printHelp();
      this.exitWithFailure();
    }

    const { values, positionals } = this.parseOptions(this.options, { allowPositionals: true });
    if (positionals.length === 0) {
      throw new InvalidArgument('Missing demo paths');
    }

    this.demoPaths = await resolveDemoPaths(positionals);
    this.analyzePositions = values['analyze-positions'] ?? false;
    this.forceAnalyze = values.force ?? false;
    this.source = values.source as DemoSource | undefined;
  }
}
