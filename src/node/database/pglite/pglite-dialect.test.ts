// Validates the embedded database backend (PGlite) against the parts of the app that are sensitive to the
// PostgreSQL server → PGlite switch:
// - all schema migrations (PL/pgSQL triggers, stored generated columns, views)
// - bulk inserts via COPY FROM '/dev/blob' as a replacement for the psql \copy command
// - int8/numeric type parsing parity with the node-pg type parsers configured in database.ts
// - SQLSTATE error codes exposure (unique violation, undefined table)
// - maintenance queries used by the app (VACUUM FULL, pg_database_size)
import { PGlite, types } from '@electric-sql/pglite';
import { Kysely, sql } from 'kysely';
import { describe, expect, it } from 'vite-plus/test';
import type { Database } from 'csdm/node/database/schema';
import { ensureMigrationsTableExists } from 'csdm/node/database/migrations/ensure-migrations-table-exists';
import { getAllMigrations } from 'csdm/node/database/migrations/get-all-migrations';
import { getDatabaseErrorCode } from 'csdm/node/database/get-database-error-code';
import { PostgresqlErrorCode } from 'csdm/node/database/postgresql-error-code';
import { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';
import { PGliteDialect } from './pglite-dialect';

type TestContext = {
  pglite: PGlite;
  db: Kysely<Database>;
};

let contextPromise: Promise<TestContext> | undefined;

async function createContext(): Promise<TestContext> {
  // In-memory instance with the same parsers as createPgliteInstance() to keep tests fast and isolated.
  const pglite = await PGlite.create({
    parsers: {
      [types.INT8]: (value: string) => {
        const valueAsNumber = Number(value);
        if (Number.isSafeInteger(valueAsNumber)) {
          return valueAsNumber;
        }

        return value;
      },
      [types.NUMERIC]: Number,
      [types.INT4]: Number,
      [types.INT2]: Number,
    },
  });

  const db = new Kysely<Database>({
    dialect: new PGliteDialect(pglite),
  });

  // Mirrors migrateDatabase() from a fresh installation state (schema version 0, no reset needed).
  await db.transaction().execute(async (transaction) => {
    await ensureMigrationsTableExists(transaction);
    const migrations = await getAllMigrations();
    for (const migration of migrations) {
      await migration.run(transaction);
    }

    await transaction
      .insertInto('migrations')
      .values({
        schema_version: 14, // CURRENT_SCHEMA_VERSION in migrate-database.ts, not exported.
        run_at: sql`now()`,
      })
      .execute();
  });

  return { pglite, db };
}

function getContext(): Promise<TestContext> {
  contextPromise ??= createContext();

  return contextPromise;
}

const matchChecksum = 'pglite-spike-checksum';

async function insertFakeMatch(db: Kysely<Database>) {
  await sql`
    INSERT INTO matches (
      checksum, demo_path, game_type, game_mode, game_mode_str, is_ranked, kill_count, death_count,
      assist_count, shot_count, winner_name, winner_side, analyze_date, overtime_count, max_rounds, has_vac_live_ban
    )
    VALUES (${matchChecksum}, '/tmp/spike.dem', 0, 0, 'competitive', false, 0, 0, 0, 0, '', 0, now(), 0, 30, false)
    ON CONFLICT (checksum) DO NOTHING
  `.execute(db);
}

// Enough rows for COPY to exercise the CSV path and for aggregates to return int8/numeric values, small enough to keep
// the suite fast. Throughput is not measured here.
const positionsRowCount = 5_000;

function buildPositionsCsv() {
  const lines: string[] = [];
  for (let index = 0; index < positionsRowCount; index++) {
    const roundNumber = (index % 24) + 1;
    lines.push(
      `${matchChecksum},${roundNumber},${index},${index},7656119800000000${index % 10},player-${index % 10},t,${
        index % 2048
      }.5,${index % 1024}.25,64.125,180.5,0,2,100,16000,100,t,f,f,f,f,f,f,f,f`,
    );
  }

  return lines.join('\n');
}

describe('PGlite dialect', () => {
  it('runs all schema migrations (v1 to v14)', async () => {
    const { db } = await getContext();

    const tables = await db.introspection.getTables();
    expect(tables.length).toBeGreaterThan(50);

    const migration = await db
      .selectFrom('migrations')
      .select('schema_version as schemaVersion')
      .orderBy('schema_version', 'desc')
      .executeTakeFirstOrThrow();
    // Also asserts the INT4 parser: schema_version must come back as a number, not a string.
    expect(migration.schemaVersion).toBe(14);
  });

  it(`bulk-inserts ${positionsRowCount} player positions with COPY FROM '/dev/blob'`, async () => {
    const { db, pglite } = await getContext();
    await insertFakeMatch(db);

    const columns =
      'match_checksum,round_number,tick,frame,player_steam_id,player_name,is_alive,x,y,z,yaw,flash_duration_remaining,side,health,money,armor,has_helmet,has_bomb,has_defuse_kit,is_ducking,is_airborne,is_scoping,is_defusing,is_planting,is_grabbing_hostage';
    const blob = new Blob([buildPositionsCsv()]);
    await pglite.query(`COPY player_positions(${columns}) FROM '/dev/blob' WITH (FORMAT csv)`, [], { blob });

    const { count } = await db
      .selectFrom('player_positions')
      .select(db.fn.countAll().as('count'))
      .executeTakeFirstOrThrow();
    // COUNT() returns an int8: asserts the INT8 parser converts it to a number.
    expect(count).toBe(positionsRowCount);

    const { averageX } = await db
      .selectFrom('player_positions')
      .select(sql`ROUND(AVG(x)::numeric, 2)`.as('averageX'))
      .executeTakeFirstOrThrow();
    // AVG()::numeric asserts the NUMERIC parser.
    expect(typeof averageX).toBe('number');
  });

  it('executes PL/pgSQL triggers', async () => {
    const { db } = await getContext();

    const steamId = '76561198000000001';
    await db
      .insertInto('steam_accounts')
      .values({
        steam_id: steamId,
        name: 'spike',
        avatar: '',
        is_community_banned: false,
        has_private_profile: false,
        vac_ban_count: 0,
        game_ban_count: 0,
        economy_ban: EconomyBan.None,
      })
      .execute();
    await db.insertInto('ignored_steam_accounts').values({ steam_id: steamId }).execute();

    const inserted = await db
      .selectFrom('steam_accounts')
      .select(['created_at', 'updated_at'])
      .where('steam_id', '=', steamId)
      .executeTakeFirstOrThrow();

    await db.updateTable('steam_accounts').set({ name: 'spike-updated' }).where('steam_id', '=', steamId).execute();

    const updated = await db
      .selectFrom('steam_accounts')
      .select('updated_at')
      .where('steam_id', '=', steamId)
      .executeTakeFirstOrThrow();
    // The update_steam_account_updated_at trigger must have bumped updated_at.
    expect(updated.updated_at.getTime()).toBeGreaterThan(inserted.updated_at.getTime());

    // The steam_account_deleted trigger must cascade the delete to ignored_steam_accounts.
    await db.deleteFrom('steam_accounts').where('steam_id', '=', steamId).execute();
    const ignoredAccount = await db
      .selectFrom('ignored_steam_accounts')
      .select('steam_id')
      .where('steam_id', '=', steamId)
      .executeTakeFirst();
    expect(ignoredAccount).toBeUndefined();
  });

  it('reads the player_ban_per_match view', async () => {
    const { db } = await getContext();

    const rows = await db.selectFrom('player_ban_per_match').selectAll().execute();
    expect(Array.isArray(rows)).toBe(true);
  });

  it('exposes SQLSTATE error codes through getDatabaseErrorCode', async () => {
    const { db } = await getContext();

    const steamId = '76561198000000002';
    const account = {
      steam_id: steamId,
      name: 'spike',
      avatar: '',
      is_community_banned: false,
      has_private_profile: false,
      vac_ban_count: 0,
      game_ban_count: 0,
      economy_ban: EconomyBan.None,
    };
    await db.insertInto('steam_accounts').values(account).execute();

    let uniqueViolation: unknown;
    try {
      await db.insertInto('steam_accounts').values(account).execute();
    } catch (error) {
      uniqueViolation = error;
    }
    expect(getDatabaseErrorCode(uniqueViolation)).toBe(PostgresqlErrorCode.UniqueViolation);

    let undefinedTable: unknown;
    try {
      await sql`SELECT * FROM table_that_does_not_exist`.execute(db);
    } catch (error) {
      undefinedTable = error;
    }
    expect(getDatabaseErrorCode(undefinedTable)).toBe(PostgresqlErrorCode.UndefinedTable);
  });

  it('serializes concurrent transactions on the single connection', async () => {
    const { db } = await getContext();

    // Kysely's PGlite driver alone would interleave these on the shared connection, the wrapper in
    // pglite-dialect.ts must serialize them.
    await Promise.all(
      ['spike-tag-a', 'spike-tag-b'].map((name) => {
        return db.transaction().execute(async (transaction) => {
          await transaction.insertInto('tags').values({ name, color: '#ffffff' }).execute();
          await transaction.selectFrom('tags').select('id').where('name', '=', name).executeTakeFirstOrThrow();
        });
      }),
    );

    const tags = await db
      .selectFrom('tags')
      .select('name')
      .where('name', 'in', ['spike-tag-a', 'spike-tag-b'])
      .execute();
    expect(tags).toHaveLength(2);
  });

  it('supports the maintenance queries used by the app', async () => {
    const { db } = await getContext();

    // Used by the optimize database handler.
    await sql`VACUUM FULL`.execute(db);

    // Used to display the database size in the settings.
    const result = await sql<{ size: string }>`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS size
    `.execute(db);
    expect(result.rows[0].size).toMatch(/\d+/);
  });
});
