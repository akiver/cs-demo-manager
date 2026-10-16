import { sql } from 'kysely';
import type { Migration } from './migration';

const v15: Migration = {
  schemaVersion: 15,
  run: async (transaction) => {
    // The kills and rounds tables are frequently filtered by match_checksum and round_number.
    // Without an index those queries is a sequential scan on tables that can hold millions of rows.
    await transaction.schema
      .createIndex('kills_match_checksum_round_number_idx')
      .ifNotExists()
      .on('kills')
      .columns(['match_checksum', 'round_number'])
      .execute();
    await transaction.schema
      .createIndex('rounds_match_checksum_number_idx')
      .ifNotExists()
      .on('rounds')
      .columns(['match_checksum', 'number'])
      .execute();

    // Players positions are stored as 1 row per player and round to reduce their size:
    // - the movement (position, yaw...) of each tick
    // - the state (health, weapons...) only when it changes, state_ticks contains the tick of each change
    // Existing positions are deleted, users have to generate them again.
    await transaction.schema.dropTable('player_positions').ifExists().execute();

    await transaction.schema
      .createTable('player_positions')
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint(
        'player_positions_match_checksum_fk',
        ['match_checksum'],
        'matches',
        ['checksum'],
        (cb) => cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('player_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('player_name', 'varchar', (col) => col.notNull())
      // Movement values of each tick packed as big-endian binary.
      .addColumn('ticks', 'bytea', (col) => col.notNull())
      .addColumn('x', 'bytea', (col) => col.notNull())
      .addColumn('y', 'bytea', (col) => col.notNull())
      .addColumn('z', 'bytea', (col) => col.notNull())
      .addColumn('yaw', 'bytea', (col) => col.notNull())
      .addColumn('flash_duration_remaining', 'bytea', (col) => col.notNull())
      .addColumn('is_ducking', 'bytea', (col) => col.notNull())
      .addColumn('is_airborne', 'bytea', (col) => col.notNull())
      // State values of each change packed the same way.
      .addColumn('state_ticks', 'bytea', (col) => col.notNull())
      .addColumn('is_alive', 'bytea', (col) => col.notNull())
      .addColumn('side', 'bytea', (col) => col.notNull())
      .addColumn('money', 'bytea', (col) => col.notNull())
      .addColumn('health', 'bytea', (col) => col.notNull())
      .addColumn('armor', 'bytea', (col) => col.notNull())
      .addColumn('has_helmet', 'bytea', (col) => col.notNull())
      .addColumn('has_bomb', 'bytea', (col) => col.notNull())
      .addColumn('has_defuse_kit', 'bytea', (col) => col.notNull())
      .addColumn('is_scoping', 'bytea', (col) => col.notNull())
      .addColumn('is_defusing', 'bytea', (col) => col.notNull())
      .addColumn('is_planting', 'bytea', (col) => col.notNull())
      .addColumn('is_grabbing_hostage', 'bytea', (col) => col.notNull())
      // Weapon names of each state, weapon lists are comma-separated.
      .addColumn('active_weapon_name', sql`text[]`, (col) => col.notNull())
      .addColumn('equipments', sql`text[]`, (col) => col.notNull())
      .addColumn('grenades', sql`text[]`, (col) => col.notNull())
      .addColumn('pistols', sql`text[]`, (col) => col.notNull())
      .addColumn('smgs', sql`text[]`, (col) => col.notNull())
      .addColumn('rifles', sql`text[]`, (col) => col.notNull())
      .addColumn('heavy', sql`text[]`, (col) => col.notNull())
      .execute();

    await transaction.schema
      .createIndex('player_positions_match_checksum_round_number_idx')
      .on('player_positions')
      .columns(['match_checksum', 'round_number'])
      .execute();

    // PostgreSQL can't convert bytes to a float, this function makes the packed float32 columns table queryable in SQL.
    // Ticks (int32) can be compared with int4send() as they use the same byte order.
    await sql`
      CREATE OR REPLACE FUNCTION float32_be(buf bytea, idx integer)
      RETURNS real
      LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE
      AS $$
      DECLARE
        -- substring() only decompresses the value up to the slice it needs, get_byte() on buf would decompress it entirely
        w    bytea := substring(buf FROM idx * 4 + 1 FOR 4);
        bits bigint;
        e    integer;
        m    integer;
        v    float8;
      BEGIN
        IF idx < 0 OR length(w) < 4 THEN
          RETURN NULL;
        END IF;

        bits := (get_byte(w, 0)::bigint << 24) | (get_byte(w, 1) << 16) | (get_byte(w, 2) << 8) | get_byte(w, 3);
        e := (bits >> 23) & 255;      -- exponent
        m := bits & 8388607;          -- 23-bit mantissa

        IF e = 255 THEN
          RETURN CASE WHEN m <> 0 THEN 'NaN'::real
                      WHEN bits >> 31 = 1 THEN '-Infinity'::real
                      ELSE 'Infinity'::real END;
        END IF;

        -- exact in float8: 24-bit integer times a power of two
        v := CASE WHEN e = 0 THEN m * 2::float8 ^ -149                 -- subnormal
                  ELSE (m + 8388608) * 2::float8 ^ (e - 150) END;      -- normal (implicit leading 1)

        RETURN CASE WHEN bits >> 31 = 1 THEN -v ELSE v END;            -- keeps -0
      END
      $$
    `.execute(transaction);

    // Whole packed columns as arrays, much faster than float32_be() when reading many values because each value is
    // decompressed once instead of once per float32_be() call. float32_be() remains faster to read a single tick.
    await sql`
      CREATE OR REPLACE FUNCTION float32_be_array(buf bytea)
      RETURNS real[]
      LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE
      AS $$
      DECLARE
        b      bytea  := buf || ''::bytea;  -- forces a single decompression into memory
        result real[] := '{}';
      BEGIN
        FOR k IN 0 .. length(b) / 4 - 1 LOOP
          result[k + 1] := float32_be(b, k);
        END LOOP;
        RETURN result;
      END
      $$
    `.execute(transaction);

    await sql`
      CREATE OR REPLACE FUNCTION int32_be_array(buf bytea)
      RETURNS integer[]
      LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE
      AS $$
      DECLARE
        b      bytea     := buf || ''::bytea;  -- forces a single decompression into memory
        result integer[] := '{}';
        bits   bigint;
      BEGIN
        FOR k IN 0 .. length(b) / 4 - 1 LOOP
          bits := (get_byte(b, k * 4)::bigint << 24) | (get_byte(b, k * 4 + 1) << 16)
                | (get_byte(b, k * 4 + 2) << 8) | get_byte(b, k * 4 + 3);
          -- two's complement for negative values
          result[k + 1] := CASE WHEN bits >= 2147483648 THEN bits - 4294967296 ELSE bits END;
        END LOOP;
        RETURN result;
      END
      $$
    `.execute(transaction);

    // Boolean columns use 1 byte per value, 1 for true and 0 for false.
    await sql`
      CREATE OR REPLACE FUNCTION bool_array(buf bytea)
      RETURNS boolean[]
      LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE
      AS $$
      DECLARE
        b      bytea     := buf || ''::bytea;  -- forces a single decompression into memory
        result boolean[] := '{}';
      BEGIN
        FOR k IN 0 .. length(b) - 1 LOOP
          result[k + 1] := get_byte(b, k) = 1;
        END LOOP;
        RETURN result;
      END
      $$
    `.execute(transaction);
  },
};

export default v15;
