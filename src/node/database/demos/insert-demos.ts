import type { Demo } from 'csdm/common/types/demo';
import { db } from 'csdm/node/database/database';
import { demoToDemoRow } from './demo-to-demo-row';

async function fetchMatches(checksums: string[]) {
  return await db
    .selectFrom('matches')
    .where('checksum', 'in', checksums)
    .select(['checksum', 'tick_count', 'tickrate', 'duration', 'framerate'])
    .execute();
}

export async function insertDemos(demos: Demo[]) {
  try {
    const matches = await fetchMatches(demos.map((demo) => demo.checksum));
    const batchSize = 1000;
    await db.transaction().execute(async (transaction) => {
      for (let i = 0; i < demos.length; i += batchSize) {
        const demosToInsert = demos.slice(i, i + batchSize);
        const demoRows = demosToInsert.map((demo) => {
          const match = matches.find((match) => match.checksum === demo.checksum);

          if (match) {
            demo.tickCount = match.tick_count;
            demo.tickrate = match.tickrate;
            demo.frameRate = match.framerate;
            demo.duration = match.duration;
          }

          return demoToDemoRow(demo);
        });
        const demoPathsRows = demosToInsert.map((demo) => {
          return {
            checksum: demo.checksum,
            file_path: demo.filePath,
          };
        });

        await transaction
          .insertInto('demos')
          .values(demoRows)
          .onConflict((oc) => oc.column('checksum').doNothing())
          .execute();
        await transaction
          .insertInto('demo_paths')
          .values(demoPathsRows)
          .onConflict((oc) => oc.columns(['checksum', 'file_path']).doNothing())
          .execute();
      }
    });
  } catch (error) {
    logger.log('Error while inserting demos');
    logger.log(error);
    throw error;
  }
}
