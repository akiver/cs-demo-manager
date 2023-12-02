import { executePsql } from './execute-psql';
import { PsqlNotFound } from './psql-error';

export async function ensurePsqlIsInstalled() {
  try {
    await executePsql('--version');
  } catch (error) {
    throw new PsqlNotFound();
  }
}
