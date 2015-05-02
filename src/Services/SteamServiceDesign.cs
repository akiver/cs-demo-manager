using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Services
{
	public class SteamServiceDesign : ISteamService
	{
		public Task<Suspect> GetBanStatusForUser(string steamId)
		{
			Suspect suspect = new Suspect
			{
				SteamId = "133713371337",
				ProfileUrl = "http://steamcommunity.com/id/133713371337/",
				Nickname = "The Suspect",
				LastLogOff = 11111,
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

		public Task<IEnumerable<Suspect>> GetBanStatusForUserList(List<string> users)
		{
			List<Suspect> suspects = new List<Suspect>();

			Suspect suspect = new Suspect
			{
				SteamId = "133713371337",
				ProfileUrl = "http://steamcommunity.com/id/133713371337/",
				Nickname = "The Suspect",
				LastLogOff = 11111,
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

			IEnumerable<Suspect> suspectOrdered = suspects.OrderBy(s => s.Nickname);

			return Task.FromResult(suspectOrdered);
		}

		public Task UpdateBannedPlayerCount(List<string> suspectIdList)
		{
			return Task.FromResult(0);
		}

		public Task<int> GetBannedPlayerCount(List<string> suspectIdList)
		{
			return Task.FromResult(1);
		}
	}
}