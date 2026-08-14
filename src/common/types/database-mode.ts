export const DatabaseMode = {
  Embedded: 'embedded',
  PostgreSql: 'postgresql',
} as const;

export type DatabaseMode = (typeof DatabaseMode)[keyof typeof DatabaseMode];
