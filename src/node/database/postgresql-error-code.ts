// https://www.postgresql.org/docs/current/errcodes-appendix.html
export const PostgresqlErrorCode = {
  UniqueViolation: '23505',
  UndefinedTable: '42P01',
  DuplicateDatabase: '42P04',
} as const;

export type PostgresqlErrorCode = (typeof PostgresqlErrorCode)[keyof typeof PostgresqlErrorCode];
