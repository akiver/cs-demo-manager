using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Services
{
	public interface ICacheService
	{
		bool HasDemoInCache(Demo demo);

		Task<Demo> GetDemoDataFromCache(Demo demo);

		Task WriteDemoDataCache(Demo demo);

		Task<bool> AddSuspectToCache(string suspectSteamCommunityId);

		Task<List<string>> GetSuspectsListFromCache();

		Task<bool> RemoveSuspectFromCache(string steamId);

		Task ClearData();
	}
}