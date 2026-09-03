import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import fs from 'fs-extra';
import { from as copyFrom } from 'pg-copy-streams';
import { acquireIngestionClient, isEmbeddedDatabase, releaseIngestionClient } from './database';
import { getPgliteInstance } from './pglite/pglite-instance';
import type { Database } from './schema';

type Options<Table> = {
  csvFilePath: string;
  tableName: keyof Database;
  columns: Array<keyof Table>;
};

// Streams a CSV file into a table using the COPY protocol.
// It's the same command that "psql \copy" runs, without requiring the psql binary: the file bytes
// are forwarded as-is to the server, there is no parsing on the JS side.
export async function copyCsvIntoTable<Table>({ csvFilePath, tableName, columns }: Options<Table>) {
  const columnNames = columns.map((column) => `"${String(column)}"`).join(',');
  const copyOptions = "WITH (FORMAT csv, DELIMITER ',', ENCODING 'UTF8')";

  if (isEmbeddedDatabase()) {
    // PGlite doesn't support COPY FROM STDIN, the file content is passed as a blob instead.
    const csv = await fs.readFile(csvFilePath);
    await getPgliteInstance().query(`COPY "${tableName}"(${columnNames}) FROM '/dev/blob' ${copyOptions}`, [], {
      blob: new Blob([csv]),
    });
    return;
  }

  const client = await acquireIngestionClient();

  try {
    const stream = client.query(copyFrom(`COPY "${tableName}"(${columnNames}) FROM STDIN ${copyOptions}`));
    // On error the pipeline destroys the stream, which sends a CopyFail to the backend.
    await pipeline(createReadStream(csvFilePath), stream);
  } finally {
    releaseIngestionClient(client);
  }
}
