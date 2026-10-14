import { createDatabaseConnection } from 'csdm/node/database/database';
import { createDaemonConnection } from 'csdm/cli/create-daemon-connection';
import type { CliWebSocketClient } from 'csdm/cli/web-socket/cli-web-socket-client';
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import { assertDatabaseSchemaVersionMatches } from 'csdm/node/database/migrations/migrate-database';
import { DatabaseSchemaVersionMismatch } from 'csdm/node/database/database-schema-version-mismatch-error';
import { type CommandOptions, parseCommandArgs } from 'csdm/cli/parse-command-args';
import { type CommandHelp, HelpFormatter } from 'csdm/cli/help-formatter';
import { CommandError } from 'csdm/cli/errors/command-error';
import { ExitCode } from 'csdm/cli/exit-code';

export abstract class Command {
  public abstract printHelp(): void;
  public abstract run(): Promise<void>;
  protected args: string[];
  protected readonly helpFormatter = new HelpFormatter();

  public constructor(args: string[]) {
    this.args = args;
  }

  protected exit(exitCode: ExitCode = ExitCode.Success) {
    return process.exit(exitCode);
  }

  protected exitWithFailure() {
    return this.exit(ExitCode.Failure);
  }

  /**
   * Prints the command help and exits when the help is requested, otherwise parses the command args.
   * Invalid args throw an InvalidArgument error.
   */
  protected parseOptions<Options extends CommandOptions>(options: Options, { allowPositionals = false } = {}) {
    if (this.args.includes('--help') || this.args.includes('-h')) {
      this.printHelp();
      this.exit();
    }

    return parseCommandArgs(this.args, options, allowPositionals);
  }

  protected printCommandHelp(help: CommandHelp) {
    console.log(this.helpFormatter.formatCommandHelp(help));
  }

  /**
   * Opens a database connection in this process for commands that run queries themselves.
   * The connection settings come from the daemon rather than the settings file: it's the only process that knows how
   * to reach the embedded server, and it runs the database migrations. The daemon client is intentionally left open
   * until the process exits so the daemon, and the embedded server with it, stay up while the command runs.
   * Migrations are not run here: the daemon owns the schema and running them from another version of the app would
   * break the daemon and its clients. The schema version is checked instead: it differs from this build's when the
   * daemon runs another version but was kept because clients are attached to it (see attachOrSpawnDaemon), the command
   * then fails rather than running queries against a schema it was not written for.
   */
  protected async initDatabaseConnection() {
    const client = await this.connectToDaemon();
    await this.ensureDaemonDatabaseConnection(client);
    try {
      const settings = await client.send({ name: CliClientMessageName.GetDatabaseConnectionSettings });
      createDatabaseConnection(settings);
      await assertDatabaseSchemaVersionMatches();
    } catch (error) {
      if (error instanceof DatabaseSchemaVersionMismatch) {
        throw new CommandError(
          `Failed to connect to the database\n${error.message}\nThe database is managed by a CS Demo Manager daemon running a different version than this CLI, close the running CS Demo Manager instances so the daemon can be replaced and retry.`,
        );
      }
      throw new CommandError('Failed to connect to the database', { cause: error });
    }
  }

  /**
   * Connects the daemon to the database, for commands that need it either in the daemon or in this process.
   * Starting the embedded server on first use (initdb) or migrating a large database after an update can take minutes,
   * so this request has no timeout: it fails only if the daemon answers with an error or the connection closes. The
   * requests that follow keep their short timeout.
   */
  protected async ensureDaemonDatabaseConnection(client: CliWebSocketClient) {
    const hintTimeoutId = setTimeout(() => {
      console.log('Connecting to the database, it may take a while on first start or after an update...');
    }, 3_000);
    try {
      await client.send({ name: CliClientMessageName.EnsureDatabaseConnection }, { timeoutMs: null });
    } catch (error) {
      throw new CommandError('Failed to connect to the database', { cause: error });
    } finally {
      clearTimeout(hintTimeoutId);
    }
  }

  protected async connectToDaemon(): Promise<CliWebSocketClient> {
    try {
      return await createDaemonConnection();
    } catch (error) {
      throw new CommandError('Failed to connect to the CS Demo Manager daemon', { cause: error });
    }
  }
}
