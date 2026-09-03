import type { PGlite } from '@electric-sql/pglite';
import type { AbortableOperationOptions, DatabaseConnection, Driver, QueryCompiler, TransactionSettings } from 'kysely';
import { PGliteDialect as KyselyPGliteDialect } from 'kysely';

// Kysely's PGlite driver hands out a single shared connection without serializing access to it: concurrent
// transactions would interleave on the same connection and corrupt each other's state. This wrapper serializes
// connection acquisition, like Kysely's built-in SQLite driver does.
class SerializedPGliteDriver implements Driver {
  private readonly driver: Driver;
  private lock: Promise<void> = Promise.resolve();
  private releaseLock: (() => void) | undefined;

  public constructor(driver: Driver) {
    this.driver = driver;
  }

  public init(options?: AbortableOperationOptions): Promise<void> {
    return this.driver.init(options);
  }

  public async acquireConnection(options?: AbortableOperationOptions): Promise<DatabaseConnection> {
    const previousLock = this.lock;
    let release!: () => void;
    this.lock = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previousLock;
    this.releaseLock = release;

    return this.driver.acquireConnection(options);
  }

  public beginTransaction(connection: DatabaseConnection, settings: TransactionSettings): Promise<void> {
    return this.driver.beginTransaction(connection, settings);
  }

  public commitTransaction(connection: DatabaseConnection): Promise<void> {
    return this.driver.commitTransaction(connection);
  }

  public rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    return this.driver.rollbackTransaction(connection);
  }

  public savepoint(
    connection: DatabaseConnection,
    savepointName: string,
    compileQuery: QueryCompiler['compileQuery'],
  ): Promise<void> {
    return this.driver.savepoint!(connection, savepointName, compileQuery);
  }

  public rollbackToSavepoint(
    connection: DatabaseConnection,
    savepointName: string,
    compileQuery: QueryCompiler['compileQuery'],
  ): Promise<void> {
    return this.driver.rollbackToSavepoint!(connection, savepointName, compileQuery);
  }

  public releaseSavepoint(
    connection: DatabaseConnection,
    savepointName: string,
    compileQuery: QueryCompiler['compileQuery'],
  ): Promise<void> {
    return this.driver.releaseSavepoint!(connection, savepointName, compileQuery);
  }

  public async releaseConnection(connection: DatabaseConnection, options?: AbortableOperationOptions): Promise<void> {
    await this.driver.releaseConnection(connection, options);
    this.releaseLock?.();
    this.releaseLock = undefined;
  }

  public destroy(options?: AbortableOperationOptions): Promise<void> {
    return this.driver.destroy(options);
  }
}

export class PGliteDialect extends KyselyPGliteDialect {
  public constructor(pglite: PGlite) {
    super({ pglite });
  }

  public override createDriver(): Driver {
    return new SerializedPGliteDriver(super.createDriver());
  }
}
