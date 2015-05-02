using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Services
{
	public interface ISteamService
	{
		Task<Suspect> GetBanStatusForUser(string steamId);

		Task<IEnumerable<Suspect>> GetBanStatusForUserList(List<string> users);

		Task UpdateBannedPlayerCount(List<string> suspectIdList);

		Task<int> GetBannedPlayerCount(List<string> suspectIdList);
	}
}