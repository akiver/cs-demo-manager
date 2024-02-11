import { getSettings } from 'csdm/node/settings/get-settings';
import { createDatabaseConnection } from 'csdm/node/database/database';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';

export abstract class Command {
  public abstract getDescription(): string;
  public abstract printHelp(): void;
  public abstract run(): Promise<void>;
  protected args: string[];

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

  protected isFlagArgument(arg: string) {
    return arg.startsWith('--');
  }

  protected formatFlagForHelp(flag: string) {
    return `[${flag}]`;
  }

  protected formatFlagsForHelp(flags: string[]) {
    return flags.map(this.formatFlagForHelp).join(' ');
  }
}
