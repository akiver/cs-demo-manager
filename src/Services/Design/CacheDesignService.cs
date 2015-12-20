using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services.Design
{
	public class CacheDesignService : ICacheService
	{
		public bool HasDemoInCache(Demo demo)
		{
			return true;
		}

		public Task<Demo> GetDemoDataFromCache(Demo demo)
		{
			demo.Id = "de_dust25445648778447878";
			demo.Name = "esea_nip_vs_titan.dem";
			demo.Tickrate = 128;
			demo.MapName = "de_dust2";
			demo.ClientName = "localhost";
			demo.Hostname = "local";
			demo.OneKillCount = 190;
			demo.TwoKillCount = 80;
			demo.ThreeKillCount = 25;
			demo.FourKillCount = 3;
			demo.FiveKillCount = 1;
			demo.Path = "C:\\mydemo.dem";
			demo.ScoreTeam1 = 16;
			demo.ScoreTeam2 = 6;
			demo.Type = "GOTV";

			return Task.FromResult(demo);
		}

		public Task WriteDemoDataCache(Demo demo)
		{
			return Task.FromResult(0);
		}

		public Task<bool> AddSuspectToCache(string suspectSteamCommunityId)
		{
			return Task.FromResult(true);
		}

		public Task<List<string>> GetSuspectsListFromCache()
		{
			List<string> suspecIdtList = new List<string>()
			{
				"121545454",
				"5455155"
			};

			return Task.FromResult(suspecIdtList);
		}

		public Task<bool> RemoveSuspectFromCache(string steamId)
		{
			return Task.FromResult(true);
		}

		public Task ClearDemosFile()
		{
			return Task.FromResult(true);
		}

		public Task CreateBackupCustomDataFile(string filePath)
		{
			return Task.FromResult(true);
		}

		public bool ContainsDemos()
		{
			return true;
		}

		public Task<bool> AddSuspectToBannedList(Suspect suspect)
		{
			return Task.FromResult(true);
		}

		public Task<List<string>> GetSuspectsBannedList()
		{
			List<string> suspecIdtList = new List<string>()
			{
				"121545454",
				"5455155"
			};

			return Task.FromResult(suspecIdtList);
		}

		public Task<bool> AddAccountAsync(Account account)
		{
			return Task.FromResult(true);
		}

		public Task<bool> RemoveAccountAsync(Account account)
		{
			return Task.FromResult(true);
		}

		public Task<List<Account>> GetAccountListAsync()
		{
			return Task.FromResult(new List<Account>());
		}

		public Task<Account> GetAccountAsync(long steamId)
		{
			return Task.FromResult(new Account());
		}

		public Task<List<string>> GetFoldersAsync()
		{
			return Task.FromResult(new List<string>());
		}

		public Task<bool> AddFolderAsync(string path)
		{
			return Task.FromResult(true);
		}

		public Task<bool> RemoveFolderAsync(string path)
		{
			return Task.FromResult(true);
		}

		public Task<List<Demo>> GetDemoListAsync()
		{
			return Task.FromResult(new List<Demo>());
		}

		public Task<List<string>> GetPlayersWhitelist()
		{
			return Task.FromResult(new List<string>());
		}

		public Task<bool> AddPlayerToWhitelist(string suspectSteamCommunityId)
		{
			return Task.FromResult(true);
		}

		public Task<bool> RemovePlayerFromWhitelist(string steamId)
		{
			return Task.FromResult(true);
		}

		public Task<long> GetCacheSizeAsync()
		{
			return Task.FromResult((long)145214);
		}
	}
}