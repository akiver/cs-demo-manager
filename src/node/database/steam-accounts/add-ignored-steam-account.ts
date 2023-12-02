import { DatabaseError } from 'pg';
import { db } from '../database';
import { getPlayerSteamIdFromSteamUrl } from 'csdm/node/steam-web-api/get-player-steam-id-from-steam-url';
import { SteamAccountAlreadyIgnored } from 'csdm/node/database/steam-accounts/errors/steam-account-already-ignored';
import { fetchIgnoredSteamAccounts } from 'csdm/node/database/steam-accounts/fetch-ignored-steam-accounts';
import { PostgresqlErrorCode } from 'csdm/node/database/postgresql-error-code';
import { insertSteamAccounts } from 'csdm/node/database/steam-accounts/insert-steam-accounts';
import { SteamAccountNotFound } from 'csdm/node/database/steam-accounts/errors/steam-account-not-found';
import { buildSteamAccountsFromSteamIds } from 'csdm/node/database/steam-accounts/build-steam-accounts-from-steam-ids';
import type { IgnoredSteamAccountRow } from './ignored-steam-account-table';

export async function addIgnoredSteamAccount(steamIdentifier: string) {
  let steamId = steamIdentifier.trim(); // by default assume that the value is a SteamID64
  if (Number.isNaN(Number.parseInt(steamId))) {
    // It's not a number, it should be a Steam community URL
    steamId = await getPlayerSteamIdFromSteamUrl(steamIdentifier);
  }

  try {
    const accountRows = await buildSteamAccountsFromSteamIds([steamId]);
    if (accountRows.length === 0) {
      throw new SteamAccountNotFound();
    }
    await insertSteamAccounts(accountRows);
    const row: IgnoredSteamAccountRow = {
      steam_id: steamId,
    };
    await db.insertInto('ignored_steam_accounts').values(row).execute();
  } catch (error) {
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case PostgresqlErrorCode.UniqueViolation:
          throw new SteamAccountAlreadyIgnored();
      }
    }
    throw error;
  }

  const ignoredAccounts = await fetchIgnoredSteamAccounts([steamId]);
  if (ignoredAccounts.length === 0) {
    throw new SteamAccountNotFound();
  }

  return ignoredAccounts[0];
}
