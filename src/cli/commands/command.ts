import { type ParseArgsOptionsConfig } from 'node:util';
import { openDatabase } from 'csdm/node/database/open-database';

export abstract class Command {
  public abstract getDescription(): string;
  public abstract printHelp(): void;
  public abstract run(): Promise<void>;
  protected args: string[];
  protected readonly commonArgs: ParseArgsOptionsConfig = {
    verbose: { type: 'boolean', short: 'v', default: false },
  };

  public constructor(args: string[]) {
    this.args = args;
  }

  protected exit() {
    return process.exit(0);
  }

  protected exitWithFailure() {
    return process.exit(1);
  }

  protected parseArgs(args: string[]) {
    if (args.includes('--help')) {
      this.printHelp();
      this.exit();
    }
  }

  protected async initDatabaseConnection() {
    // ! The CLI never stops the embedded cluster, the app may be running and using it.
    await openDatabase();
  }

  protected isFlagArgument(arg: string) {
    return arg.startsWith('--');
  }

  protected formatFlagForHelp = (flag: string) => {
    return `[${flag}]`;
  };

  protected formatFlagsForHelp(flags: string[]) {
    return flags.map(this.formatFlagForHelp).join(' ');
  }
}
