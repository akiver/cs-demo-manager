import { db } from 'csdm/node/database/database';

export async function deleteDemos() {
  await db.transaction().execute(async (transaction) => {
    // delete rows from the demos and demo_paths tables only if they don't have a corresponding match.
    // this way we don't end up with matches referencing a missing demo, which contains base information such as map and game type.
    const demosQuery = transaction
      .deleteFrom('demos')
      .where((eb) =>
        eb.not(
          eb.exists(
            eb.selectFrom('matches').select('matches.checksum').whereRef('matches.checksum', '=', 'demos.checksum'),
          ),
        ),
      );

    const demoPathsQuery = transaction
      .deleteFrom('demo_paths')
      .where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom('matches')
              .select('matches.checksum')
              .whereRef('matches.checksum', '=', 'demo_paths.checksum'),
          ),
        ),
      );

    await Promise.all([demosQuery.execute(), demoPathsQuery.execute()]);
  });
}
