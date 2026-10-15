import path from 'node:path';
import { Command } from './command';
import { DemoSource, SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import type { Analysis } from 'csdm/common/types/analysis';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { resolveDemoPaths } from 'csdm/cli/resolve-demo-paths';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { CommandError } from 'csdm/cli/errors/command-error';
import { getErrorMessage } from 'csdm/cli/get-error-message';
import { ExitCode } from 'csdm/cli/exit-code';
import { output } from 'csdm/cli/output';

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
    ...this.jsonOption,
  } satisfies CommandOptions;
  private demoPaths: string[] = [];
  private isJsonOutput = false;
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
      throw new CommandError('No demos found');
    }

    await migrateSettings();
    const client = await this.connectToDaemon();
    await this.ensureDaemonDatabaseConnection(client);

    output.log(`${this.demoPaths.length} demos to process`);

    const pendingChecksums = new Set<string>();
    const lastStatusPerChecksum = new Map<string, AnalysisStatus>();
    const demoPathPerChecksum = new Map<string, string>();
    const analyzedDemos: { demoPath: string; checksum: string }[] = [];
    const failedDemos: { demoPath: string; details: string }[] = [];
    const skippedDemoPaths: string[] = [];
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

    const printProgress = (message: string) => {
      const processedDemoCount = analyzedDemos.length + skippedDemoPaths.length + failedDemos.length;
      output.progress(`[${processedDemoCount}/${this.demoPaths.length}] ${message}`);
    };

    const onAnalysisUpdated = (analysis: Analysis) => {
      const { demoChecksum: checksum, demoPath, status } = analysis;
      if (!pendingChecksums.has(checksum) || lastStatusPerChecksum.get(checksum) === status) {
        return;
      }
      lastStatusPerChecksum.set(checksum, status);

      const demoName = path.basename(demoPath);
      switch (status) {
        case AnalysisStatus.Analyzing:
          printProgress(`Analyzing ${demoName}...`);
          break;
        case AnalysisStatus.Inserting:
          printProgress(`Inserting ${demoName} into the database...`);
          break;
        case AnalysisStatus.InsertSuccess:
          analyzedDemos.push({ demoPath, checksum });
          printProgress(`${demoName} inserted into the database`);
          markAnalysisAsDone(checksum);
          break;
        case AnalysisStatus.AnalyzeError:
        case AnalysisStatus.InsertError: {
          const message =
            status === AnalysisStatus.AnalyzeError
              ? `Failed to analyze ${demoName}`
              : `Failed to insert ${demoName} into the database`;
          failedDemos.push({ demoPath, details: analysis.output === '' ? message : analysis.output });
          output.error(message);
          markAnalysisAsDone(checksum);
          break;
        }
      }
    };

    client.on(ServerPushMessageName.AnalysisUpdated, onAnalysisUpdated);

    const result = await client.send(
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

    for (const demoPath of result.skippedDemoPaths) {
      skippedDemoPaths.push(demoPath);
      printProgress(`${path.basename(demoPath)} already in the database, skipping it`);
    }
    for (const { demoPath, source, reason } of result.unsupportedDemos) {
      failedDemos.push({ demoPath, details: this.getUnsupportedDemoMessage(source, reason) });
      output.error(`Failed to analyze ${path.basename(demoPath)}`);
    }
    for (const { checksum, demoPath } of result.addedDemos) {
      pendingChecksums.add(checksum);
      demoPathPerChecksum.set(checksum, demoPath);
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
            output.error('Some analyses did not complete, check the demos in the GUI or re-run the command.');
            resolveCompletion();
          }
        } catch (error) {
          output.error(getErrorMessage(error));
          resolveCompletion();
        }
      }, daemonStatusPollIntervalMs);

      await completion;
      clearInterval(pollIntervalId);
    }

    client.close();

    for (const checksum of pendingChecksums) {
      const demoPath = demoPathPerChecksum.get(checksum) ?? checksum;
      failedDemos.push({ demoPath, details: 'The analysis did not complete' });
    }

    output.summary({
      succeeded: analyzedDemos.length,
      label: 'analyzed',
      skipped: skippedDemoPaths.length,
      failed: failedDemos.length,
    });
    output.failedDemos(failedDemos);

    if (this.isJsonOutput) {
      output.json({
        analyzed: analyzedDemos,
        skipped: skippedDemoPaths.map((demoPath) => ({ demoPath })),
        failed: failedDemos.map(({ demoPath, details }) => ({ demoPath, error: details })),
      });
    }

    if (failedDemos.length > 0) {
      this.markAsFailed();
    }
  }

  private getUnsupportedDemoMessage(source: DemoSource, reason: 'source' | 'pov') {
    if (reason === 'pov') {
      return 'POV demos are supported only for CS:GO';
    }
    if (this.source !== undefined) {
      return `The source "${source}" is not supported for this game`;
    }
    if (source === DemoSource.Unknown) {
      return 'The demo source could not be detected, use --source to force one';
    }

    return `The demo source "${source}" is not supported, use --source to force another one`;
  }

  protected async parseArgs() {
    if (this.args.length === 0) {
      this.printHelp();
      this.exit(ExitCode.InvalidUsage);
    }

    const { values, positionals } = this.parseOptions(this.options, { allowPositionals: true });
    if (positionals.length === 0) {
      throw new InvalidArgument('Missing demo paths');
    }

    this.demoPaths = await resolveDemoPaths(positionals);
    this.analyzePositions = values['analyze-positions'] ?? false;
    this.forceAnalyze = values.force ?? false;
    this.source = values.source as DemoSource | undefined;
    this.isJsonOutput = values.json ?? false;
    if (this.isJsonOutput) {
      output.enableJsonMode();
    }
  }
}
