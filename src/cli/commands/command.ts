import { type ParseArgsOptionsConfig } from 'node:util';
import { getSettings } from 'csdm/node/settings/get-settings';
import { createDatabaseConnection } from 'csdm/node/database/database';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { createDaemonConnection } from 'csdm/cli/create-daemon-connection';
import type { CliWebSocketClient } from 'csdm/cli/web-socket/cli-web-socket-client';

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
    const settings = await getSettings();
    createDatabaseConnection(settings.database);
    await migrateDatabase();
  }

  protected async connectToDaemon(): Promise<CliWebSocketClient> {
    try {
      return await createDaemonConnection();
    } catch (error) {
      console.error('Failed to connect to the CS Demo Manager daemon');
      console.error(error instanceof Error ? error.message : error);
      return this.exitWithFailure();
    }
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
