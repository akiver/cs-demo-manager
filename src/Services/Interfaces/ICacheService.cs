using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Services.Interfaces
{
	public interface ICacheService
	{
		bool HasDemoInCache(Demo demo);

		Task<Demo> GetDemoDataFromCache(Demo demo);

		Task WriteDemoDataCache(Demo demo);

		Task<bool> AddSuspectToCache(string suspectSteamCommunityId);

		Task<List<string>> GetSuspectsListFromCache();

		Task<bool> RemoveSuspectFromCache(string steamId);

		Task ClearDemosFile();

		Task CreateBackupCustomDataFile(string filePath);

		bool ContainsDemos();

		Task<bool> AddSuspectToBannedList(Suspect suspect);

		Task<List<string>> GetSuspectsBannedList();

		Task<bool> AddAccountAsync(Account account);

		Task<bool> RemoveAccountAsync(Account account);

		Task<List<Account>> GetAccountListAsync();

		Task<Account> GetAccountAsync(long steamId);

		Task<List<string>> GetFoldersAsync();

		Task<bool> AddFolderAsync(string path);

		Task<bool> RemoveFolderAsync(string path);

		/// <summary>
		/// Return all the demos inside each folders
		/// </summary>
		/// <returns></returns>
		Task<List<Demo>> GetDemoListAsync();

		Task<List<string>> GetPlayersWhitelist();

		Task<bool> AddPlayerToWhitelist(string suspectSteamCommunityId);

		Task<bool> RemovePlayerFromWhitelist(string steamId);

		/// <summary>
		/// Return the size of the cache folder
		/// </summary>
		/// <returns></returns>
		Task<long> GetCacheSizeAsync();

		Task<bool> RemoveDemo(Demo demo);
	}
}