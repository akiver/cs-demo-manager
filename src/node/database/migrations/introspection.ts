import type { Transaction } from 'kysely';
import type { Database } from '../schema';

export async function tableHasColumn(transaction: Transaction<Database>, tableName: string, columnName: string) {
  const tables = await transaction.introspection.getTables();
  const table = tables.find((table) => table.name === tableName);
  if (!table) {
    throw new Error(`Table ${tableName} not found`);
  }

  return table.columns.some((column) => column.name === columnName);
}
