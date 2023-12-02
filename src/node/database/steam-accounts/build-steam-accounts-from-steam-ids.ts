import { getDateDaysAgo } from 'csdm/common/date/get-date-days-ago';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';
import { getUsersBan } from 'csdm/node/steam-web-api/get-players-bans';
import { getUsersSummary } from 'csdm/node/steam-web-api/get-users-summary';
import { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';
import type { InsertableSteamAccount } from './steam-account-table';

export async function buildSteamAccountsFromSteamIds(steamIds: string[]): Promise<InsertableSteamAccount[]> {
  // ! Do not run it in parallel to avoid a potential rate limit HTTP error.
  const users = await getUsersSummary(steamIds);
  const bans = await getUsersBan(steamIds);

  const rows: InsertableSteamAccount[] = [];
  for (const steamId of steamIds) {
    const user = users.find((user) => user.steamid === steamId);
    if (user === undefined) {
      continue;
    }

    const ban = bans.find((ban) => ban.SteamId === steamId);
    const row: InsertableSteamAccount = {
      steam_id: steamId,
      name: user.personaname,
      avatar: user.avatarfull,
      has_private_profile: user.communityvisibilitystate !== 3,
      is_community_banned: ban?.CommunityBanned ?? false,
      economy_ban: ban?.EconomyBan ?? EconomyBan.None,
      last_ban_date: ban && ban.DaysSinceLastBan > 0 ? getDateDaysAgo(ban.DaysSinceLastBan) : null,
      game_ban_count: ban?.NumberOfGameBans ?? 0,
      vac_ban_count: ban?.NumberOfVACBans ?? 0,
      creation_date: user.timecreated ? unixTimestampToDate(user.timecreated) : null,
    };

    rows.push(row);
  }

  return rows;
}
