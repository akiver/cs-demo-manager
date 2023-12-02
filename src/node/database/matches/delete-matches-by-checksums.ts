import { db } from 'csdm/node/database/database';

export async function deleteMatchesByChecksums(checksums: string[]) {
  try {
    await db.transaction().execute(async (transaction) => {
      await transaction.deleteFrom('matches').where('checksum', 'in', checksums).execute();
    });
  } catch (error) {
    logger.error('Error while deleting matches');
    logger.error(error);
    throw error;
  }
}
