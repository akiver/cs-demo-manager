// https://www.postgresql.org/docs/15/errcodes-appendix.html
export const PostgresqlErrorCode = {
  UniqueViolation: '23505',
  UndefinedTable: '42P01',
} as const;

export type PostgresqlErrorCode = (typeof PostgresqlErrorCode)[keyof typeof PostgresqlErrorCode];
