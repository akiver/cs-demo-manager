import { DatabaseError } from 'pg';
import { messages } from '@electric-sql/pglite';

// node-pg (PostgreSQL mode) and PGlite (embedded mode) both throw their own DatabaseError class exposing the
// SQLSTATE error code in a `code` property.
export function getDatabaseErrorCode(error: unknown) {
  if (error instanceof DatabaseError || error instanceof messages.DatabaseError) {
    return error.code;
  }

  return undefined;
}
