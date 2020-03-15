using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Steam;
using Services.Interfaces;

namespace Services.Design
{
	public class SteamDesignService : ISteamService
	{
		public Task<Suspect> GetBanStatusForUser(string steamId)
		{
			Suspect suspect = new Suspect
			{
				SteamId = "133713371337",
				ProfileUrl = "http://steamcommunity.com/id/133713371337/",
				Nickname = "The Suspect",
				CurrentStatus = 0,
				ProfileState = 0,
				AvatarUrl = "http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
				CommunityVisibilityState = 0,
				DaySinceLastBanCount = 10,
				BanCount = 1,
				VacBanned = true,
				CommunityBanned = false,
				EconomyBan = "none"
			};

			return Task.FromResult(suspect);
		}

		public Task<List<Suspect>> GetBanStatusForUserList(List<string> users)
		{
			List<Suspect> suspects = new List<Suspect>();

			Suspect suspect = new Suspect
			{
				SteamId = "133713371337",
				ProfileUrl = "http://steamcommunity.com/id/133713371337/",
				Nickname = "The Suspect",
				CurrentStatus = 0,
				ProfileState = 0,
				AvatarUrl = "http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
				CommunityVisibilityState = 0,
				DaySinceLastBanCount = 10,
				BanCount = 1,
				VacBanned = true,
				CommunityBanned = false,
				EconomyBan = "none"
			};

			suspects.Add(suspect);

			return Task.FromResult(suspects);
		}

		public Task UpdateBannedPlayerCount(List<string> suspectIdList, List<string> suspectBannedIdList)
		{
			return Task.FromResult(0);
		}

		public Task<int> GetBannedPlayerCount(List<string> suspectIdList)
		{
			return Task.FromResult(1);
		}

		public Task<List<Suspect>> GetNewSuspectBannedList(List<string> suspectIdList, List<string> suspectBannedIdList)
		{
			List<Suspect> suspects = new List<Suspect>();

			Suspect suspect = new Suspect
			{
				SteamId = "133713371337",
				ProfileUrl = "http://steamcommunity.com/id/133713371337/",
				Nickname = "The Suspect",
				CurrentStatus = 0,
				ProfileState = 0,
				AvatarUrl =
					"http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
				CommunityVisibilityState = 0,
				DaySinceLastBanCount = 10,
				BanCount = 1,
				VacBanned = true,
				CommunityBanned = false,
				EconomyBan = "none"
			};

			suspects.Add(suspect);

			return Task.FromResult(suspects);
		}

		public Task<List<PlayerSummary>> GetUserSummaryAsync(List<string> users)
		{
			Random random = new Random();
			return Task.FromResult(new List<PlayerSummary>
			{
				new PlayerSummary
				{
					SteamId = random.Next(151541578).ToString(),
					Avatar = "../resources/images/avatar.jpg",
					AvatarFull = "../resources/images/avatar.jpg",
					AvatarMedium =  "../resources/images/avatar.jpg",
					PersonaState = 1,
					CommunityVisibilityState = 3,
					PersonaName = "AkiVer",
					ProfileState = 1,
					RealName = "AkiVer",
					ProfileUrl = "http://steamcommunity.com/id/AkiVer",
					TimeCreated = 1442916551
				}
			});
		}

		public Task<int> GenerateMatchListFile(CancellationToken ct)
		{
			return Task.FromResult(1);
		}

		public Task<string> GetSteamIdFromSteamProfileUsername(string username)
		{
			return Task.FromResult("12345");
		}

		public Task<string> GetSteamIdFromUrlOrSteamId(string steamUrl)
		{
			return Task.FromResult("12345");
		}

		public Task<int> DownloadDemoFromShareCode(string shareCode, CancellationToken ct)
		{
			return Task.FromResult(0);
		}
	}
}
