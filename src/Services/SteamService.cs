using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json.Linq;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Steam;
using System.Text.RegularExpressions;

namespace CSGO_Demos_Manager.Services
{
	public class SteamService : ISteamService
	{
		private const string PLAYERS_BAN_URL = "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key={0}&steamids={1}";
		private const string PLAYERS_SUMMARIES_URL = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v1/?key={0}&steamids={1}";
		private const string STEAM_COMMUNITY_URL_PATTERN = "http://steamcommunity.com/profiles/(?<steamID>\\d*)/";
		private readonly Regex _regexSteamCommunityUrl = new Regex(STEAM_COMMUNITY_URL_PATTERN);

		/// <summary>
		/// Update the number of player banned from the suspects list
		/// </summary>
		/// <param name="suspectIdList"></param>
		public async Task UpdateBannedPlayerCount(List<string> suspectIdList)
		{
			if (suspectIdList.Any())
			{
				IEnumerable<Suspect> suspects = await GetBanStatusForUserList(suspectIdList);
				int bannedPlayerCount = suspects.Count(s => s.VacBanned);
				Properties.Settings.Default.BannedPlayerCount = bannedPlayerCount;
				Properties.Settings.Default.Save();
			}
		}

		/// <summary>
		/// Return the number of player banned since last time that the app has been launched
		/// </summary>
		/// <param name="suspectIdList"></param>
		/// <returns></returns>
		public async Task<int> GetBannedPlayerCount(List<string> suspectIdList)
		{
			int newBannedPlayerCount = 0;
			int currentBannedPlayerCount = Properties.Settings.Default.BannedPlayerCount;

			if (!suspectIdList.Any()) return newBannedPlayerCount;

			IEnumerable<Suspect> suspects = await GetBanStatusForUserList(suspectIdList);
			int bannedPlayerCountFromCurrentList = suspects.Count(s => s.VacBanned);
			if (bannedPlayerCountFromCurrentList > currentBannedPlayerCount)
			{
				newBannedPlayerCount = bannedPlayerCountFromCurrentList - currentBannedPlayerCount;
				Properties.Settings.Default.BannedPlayerCount = bannedPlayerCountFromCurrentList;
				Properties.Settings.Default.Save();
			}

			return newBannedPlayerCount;
		}

		public async Task<Suspect> GetBanStatusForUser(string steamId)
		{
			Match match = _regexSteamCommunityUrl.Match(steamId);
			if(match.Success)
			{
				steamId = match.Groups["steamID"].Value;
			}
			
			using (var httpClient = new HttpClient())
			{
				//  Grab general infos from user
				string url = string.Format(PLAYERS_SUMMARIES_URL, AppSettings.STEAM_API_KEY, steamId);
				HttpResponseMessage result = await httpClient.GetAsync(url);
				string json = await result.Content.ReadAsStringAsync();
				JObject o = JObject.Parse(json);
				var playerSummary = o.SelectToken("response.players.player[0]").ToObject<PlayerSummary>();
				if (playerSummary == null) return null;

				// Grab VAC ban infos from user
				url = string.Format(PLAYERS_BAN_URL, AppSettings.STEAM_API_KEY, steamId);
				result = await httpClient.GetAsync(url);
				json = await result.Content.ReadAsStringAsync();
				o = JObject.Parse(json);
				var playerBan = o.SelectToken("players[0]").ToObject<PlayerBan>();
				if (playerBan == null) return null;

				Suspect suspect = new Suspect
				{
					SteamId = playerSummary.SteamId,
					ProfileUrl = playerSummary.ProfileUrl,
					Nickname = playerSummary.PersonaName,
					LastLogOff = playerSummary.LastLogoff,
					CurrentStatus = playerSummary.PersonaState,
					ProfileState = playerSummary.ProfileState,
					AvatarUrl = playerSummary.AvatarFull,
					CommunityVisibilityState = playerSummary.CommunityVisibilityState,
					DaySinceLastBanCount = playerBan.DaysSinceLastBan,
					BanCount = playerBan.NumberOfVacBans,
					VacBanned = playerBan.VacBanned,
					CommunityBanned = playerBan.CommunityBanned,
					EconomyBan = playerBan.EconomyBan
				};

				return suspect;
			}
		}

		public async Task<IEnumerable<Suspect>> GetBanStatusForUserList(List<string> users)
		{
			using (var httpClient = new HttpClient())
			{
				string ids = string.Join(",", users.ToArray());

				//  Grab general infos from user
				string url = string.Format(PLAYERS_SUMMARIES_URL, AppSettings.STEAM_API_KEY, ids);
				HttpResponseMessage result = await httpClient.GetAsync(url);
				string json = await result.Content.ReadAsStringAsync();
				JObject o = JObject.Parse(json);
				var playerSummaryList = o.SelectToken("response.players.player").ToObject<List<PlayerSummary>>();
				if (playerSummaryList == null) return null;

				// Grab VAC ban infos from user
				url = string.Format(PLAYERS_BAN_URL, AppSettings.STEAM_API_KEY, ids);
				result = await httpClient.GetAsync(url);
				json = await result.Content.ReadAsStringAsync();
				o = JObject.Parse(json);
				var playerBanList = o.SelectToken("players").ToObject<List<PlayerBan>>();
				if (playerBanList == null) return null;

				List<Suspect> suspects = new List<Suspect>();

				foreach(PlayerSummary playerSummary in playerSummaryList)
				{
					Suspect suspect = new Suspect
					{
						SteamId = playerSummary.SteamId,
						ProfileUrl = playerSummary.ProfileUrl,
						Nickname = playerSummary.PersonaName,
						LastLogOff = playerSummary.LastLogoff,
						CurrentStatus = playerSummary.PersonaState,
						ProfileState = playerSummary.ProfileState,
						AvatarUrl = playerSummary.AvatarFull,
						CommunityVisibilityState = playerSummary.CommunityVisibilityState
					};
					suspects.Add(suspect);
				}

				foreach (PlayerBan playerBan in playerBanList)
				{
					suspects.First(pl => pl.SteamId == playerBan.SteamId).DaySinceLastBanCount = playerBan.DaysSinceLastBan;
					suspects.First(pl => pl.SteamId == playerBan.SteamId).BanCount = playerBan.NumberOfVacBans;
					suspects.First(pl => pl.SteamId == playerBan.SteamId).VacBanned = playerBan.VacBanned;
					suspects.First(pl => pl.SteamId == playerBan.SteamId).CommunityBanned = playerBan.CommunityBanned;
					suspects.First(pl => pl.SteamId == playerBan.SteamId).EconomyBan = playerBan.EconomyBan;
				}

				IEnumerable<Suspect> suspectOrdered = suspects.OrderBy(suspect => suspect.Nickname);

				return suspectOrdered;
			}
		}
	}
}
