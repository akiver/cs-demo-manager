using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Steam;

namespace CSGO_Demos_Manager.Services
{
	public interface ISteamService
	{
		Task<Suspect> GetBanStatusForUser(string steamId);

		Task<IEnumerable<Suspect>> GetBanStatusForUserList(List<string> users);

		Task<List<Suspect>> GetNewSuspectBannedList(List<string> suspectIdList, List<string> suspectBannedIdList);

		/// <summary>
		/// Return user summary (general information about the account)
		/// </summary>
		/// <param name="users"></param>
		/// <returns></returns>
		Task<List<PlayerSummary>> GetUserSummaryAsync(List<string> users);
	}
}