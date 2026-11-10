import { getPostgreSqlVersion } from 'csdm/node/database/get-postgresql-version';

export async function fetchPostgreSqlVersionHandler() {
  const version = await getPostgreSqlVersion();

  return version;
}
