import { getDateDaysAgo } from 'csdm/common/date/get-date-days-ago';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';
import { getUsersBan } from 'csdm/node/steam-web-api/get-players-bans';
import { getUsersSummary } from 'csdm/node/steam-web-api/get-users-summary';
import { db } from '../database';
import type { UpdateableSteamAccount } from './steam-account-table';

function hasAccountBeenBanned({
  currentGameBanCount,
  currentVacBanCount,
  newGameBanCount,
  newVacBanCount,
  daysSinceLastBan,
  updatedAt,
}: {
  daysSinceLastBan: number;
  updatedAt: Date;
  newVacBanCount: number;
  currentVacBanCount: number;
  newGameBanCount: number;
  currentGameBanCount: number;
}) {
  const banCountChanged = newVacBanCount !== currentVacBanCount || newGameBanCount !== currentGameBanCount;
  if (!banCountChanged) {
    return false;
  }

  const banDate = getDateDaysAgo(daysSinceLastBan);

  return banDate > updatedAt;
}

export async function updateSteamAccountsFromSteam(steamIdsToIgnore: string[]) {
  let query = db.selectFrom('steam_accounts').selectAll();
  if (steamIdsToIgnore.length > 0) {
    query = query.where('steam_id', 'not in', steamIdsToIgnore);
  }

  const rows = await query.execute();

  const steamIds = rows.map((row) => row.steam_id);
  // ! Do not run it in parallel to avoid a potential rate limit HTTP error.
  const users = await getUsersSummary(steamIds);
  const bans = await getUsersBan(steamIds);

  const newBannedSteamIds: string[] = [];
  for (const steamId of steamIds) {
    const user = users.find((user) => user.steamid === steamId);
    if (user === undefined) {
      continue;
    }
    const ban = bans.find((ban) => ban.SteamId === steamId);
    if (ban === undefined) {
      continue;
    }
    const currentAccountRow = rows.find((row) => row.steam_id === steamId);
    if (currentAccountRow === undefined) {
      continue;
    }

    const accountHasBeenBanned = hasAccountBeenBanned({
      currentVacBanCount: currentAccountRow.vac_ban_count,
      newVacBanCount: ban.NumberOfVACBans,
      currentGameBanCount: currentAccountRow.game_ban_count,
      newGameBanCount: ban.NumberOfGameBans,
      daysSinceLastBan: ban.DaysSinceLastBan,
      updatedAt: currentAccountRow.updated_at,
    });
    if (accountHasBeenBanned) {
      newBannedSteamIds.push(ban.SteamId);
    }

    const row: UpdateableSteamAccount = {
      steam_id: steamId,
      name: user.personaname,
      avatar: user.avatarfull,
      has_private_profile: user.communityvisibilitystate !== 3,
      is_community_banned: ban.CommunityBanned,
      economy_ban: ban.EconomyBan,
      last_ban_date: ban.DaysSinceLastBan > 0 ? getDateDaysAgo(ban.DaysSinceLastBan) : null,
      game_ban_count: ban.NumberOfGameBans,
      vac_ban_count: ban.NumberOfVACBans,
      creation_date: user.timecreated ? unixTimestampToDate(user.timecreated) : null,
    };

    await db.updateTable('steam_accounts').set(row).where('steam_id', '=', steamId).execute();
  }

  return newBannedSteamIds;
}
