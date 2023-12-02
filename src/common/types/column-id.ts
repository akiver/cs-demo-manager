// Type for the primary key column ID of tables (int8/BIGSERIAL Postgres type).
// It may be a string if the value is too big to be represented as a safe JS number, see database.ts for details.
export type ColumnID = number | string;
