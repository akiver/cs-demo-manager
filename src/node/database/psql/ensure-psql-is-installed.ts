import { executePsql } from './execute-psql';
import { PsqlNotFound } from './psql-error';

export async function ensurePsqlIsInstalled() {
  try {
    await executePsql('--version');
  } catch (error) {
    logger.log('psql not found');
    logger.log(error);
    logger.log(process.env);
    throw new PsqlNotFound();
  }
}
