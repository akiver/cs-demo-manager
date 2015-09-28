using System;
using CSGO_Demos_Manager.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Services.Serialization;

namespace CSGO_Demos_Manager.Services
{
	public class CacheService : ICacheService
	{
		#region Properties

		/// <summary>
		/// Directory's path where are located JSON files
		/// </summary>
		private readonly string _pathFolderCache;

		/// <summary>
		/// JSON Settings
		/// </summary>
		private readonly JsonSerializerSettings _settingsJson = new JsonSerializerSettings();

		private const string SUSPECT_FILENAME = "suspects.json";

		/// <summary>
		///  Contains the ids of suspects that as been detected as banned
		/// </summary>
		private const string SUSPECT_BANNED_FILENAME = "suspects_banned.json";

		/// <summary>
		/// Contains the tracked Account
		/// </summary>
		private const string ACCOUNTS_FILENAME = "accounts.json";

		/// <summary>
		/// Contains the folders list saved
		/// </summary>
		private const string FOLDERS_FILENAME = "folders.json";

		private readonly Regex _demoFilePattern = new Regex("^(.*?)(_|[0-9]+)(.json)$");

#endregion

		public CacheService()
		{
			_pathFolderCache = AppSettings.GetFolderCachePath();
			if (!File.Exists(_pathFolderCache + "\\" + SUSPECT_FILENAME))
				File.Create(_pathFolderCache + "\\" + SUSPECT_FILENAME);
			if (!File.Exists(_pathFolderCache + "\\" + SUSPECT_BANNED_FILENAME))
				File.Create(_pathFolderCache + "\\" + SUSPECT_BANNED_FILENAME);
#if DEBUG

			_settingsJson.Formatting = Formatting.Indented;
#endif
			_settingsJson.ReferenceLoopHandling = ReferenceLoopHandling.Serialize;
			_settingsJson.PreserveReferencesHandling = PreserveReferencesHandling.All;
			_settingsJson.NullValueHandling = NullValueHandling.Include;
		}

		public async Task<List<Demo>> GetDemoListAsync()
		{
			List<Demo> demos = new List<Demo>();
			string[] fileList = Directory.GetFiles(_pathFolderCache);

			foreach (string file in fileList)
			{
				if (File.Exists(file))
				{
					Match match = _demoFilePattern.Match(file);
					if (match.Success)
					{
						string json = File.ReadAllText(file);
						try
						{
							Demo demo = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<Demo>(json, _settingsJson));
							demos.Add(demo);
						}
						catch (Exception e)
						{
							Logger.Instance.Log(e);
							throw;
						}
					}
				}
			}

			return demos;
		}

		/// <summary>
		/// Check if the JSON file for the demo exist
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		public bool HasDemoInCache(Demo demo)
		{
			string pathDemoFileJson = _pathFolderCache + "\\" + demo.Id + ".json";
			return File.Exists(pathDemoFileJson);
		}

		/// <summary>
		/// Return the demo's data from its JSON file
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		public async Task<Demo> GetDemoDataFromCache(Demo demo)
		{
			string pathDemoFileJson = _pathFolderCache + "\\" + demo.Id + ".json";

			string json = File.ReadAllText(pathDemoFileJson);

			Demo demoFromJson;
			try
			{
				demoFromJson = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<Demo>(json, _settingsJson));
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
				throw;
			}

			return demoFromJson;
		}

		/// <summary>
		/// Write the JSON file with demo's data
		/// Overwrite the file if it exists
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		public async Task WriteDemoDataCache(Demo demo)
		{
			string pathDemoFileJson = _pathFolderCache + "\\" + demo.Id + ".json";

			string json;
			try
			{
				json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(demo, _settingsJson));
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
				throw;
			}

			File.WriteAllText(pathDemoFileJson, json);
		}

		/// <summary>
		/// Add a player to the suspects list
		/// </summary>
		/// <param name="suspectSteamCommunityId"></param>
		/// <returns></returns>
		public async Task<bool> AddSuspectToCache(string suspectSteamCommunityId)
		{
			// Get current list
			List<string> ids = await GetSuspectsListFromCache();

			// Check if already in the list
			if (ids.Contains(suspectSteamCommunityId)) return false;

			ids.Add(suspectSteamCommunityId);

			string json;
			try
			{
				json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(ids));
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
				throw;
			}

			string pathSuspectsFileJson = _pathFolderCache + "\\" + SUSPECT_FILENAME;
			File.WriteAllText(pathSuspectsFileJson, json);

			return true;
		}

		/// <summary>
		/// Add a player to the suspects banned list
		/// </summary>
		/// <param name="suspect"></param>
		/// <returns></returns>
		public async Task<bool> AddSuspectToBannedList(Suspect suspect)
		{
			// Get current list
			List<string> ids = await GetSuspectsBannedList();

			// Check if already in the list
			if (ids.Contains(suspect.SteamId)) return false;

			ids.Add(suspect.SteamId);
			// If not add it and update
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(ids));

			string pathSuspectsBannedFileJson = _pathFolderCache + "\\" + SUSPECT_BANNED_FILENAME;
			File.WriteAllText(pathSuspectsBannedFileJson, json);

			return true;
		}

		/// <summary>
		/// Return the suspects SteamID from the list
		/// </summary>
		/// <returns></returns>
		public async Task<List<string>> GetSuspectsListFromCache()
		{
			string pathSuspectsFileJson = _pathFolderCache + "\\" + SUSPECT_FILENAME;
			if (!File.Exists(pathSuspectsFileJson)) return new List<string>();
			string json = File.ReadAllText(pathSuspectsFileJson);
			List<string> ids = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<string>>(json));
			if (ids == null) ids = new List<string>();

			return ids;
		}

		/// <summary>
		/// Return the suspects banned SteamID from the list
		/// </summary>
		/// <returns></returns>
		public async Task<List<string>> GetSuspectsBannedList()
		{
			string pathSuspectsFileJson = _pathFolderCache + "\\" + SUSPECT_BANNED_FILENAME;
			if (!File.Exists(pathSuspectsFileJson)) return new List<string>();
			string json = File.ReadAllText(pathSuspectsFileJson);
			List<string> ids = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<string>>(json));
			if (ids == null) ids = new List<string>();

			return ids;
		}

		/// <summary>
		/// Return the accounts SteamID from the list saved in accounts.json
		/// </summary>
		/// <returns></returns>
		public async Task<List<Account>> GetAccountListAsync()
		{
			string pathAccountsFileJson = _pathFolderCache + "\\" + ACCOUNTS_FILENAME;
			if (!File.Exists(pathAccountsFileJson)) return new List<Account>();
			string json = File.ReadAllText(pathAccountsFileJson);
			List<Account> accounts = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Account>>(json));
			if (accounts == null) accounts = new List<Account>();

			return accounts;
		}

		public async Task<Account> GetAccountAsync(long steamId)
		{
			string pathAccountsFileJson = _pathFolderCache + "\\" + ACCOUNTS_FILENAME;
			if (!File.Exists(pathAccountsFileJson)) return null;
			string json = File.ReadAllText(pathAccountsFileJson);
			List<Account> accounts = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Account>>(json));
			Account account = accounts?.FirstOrDefault(a => a.SteamId == steamId.ToString());
			return account;
		}

		public async Task<bool> AddAccountAsync(Account newAccount)
		{
			// Get current list
			List<Account> accounts = await GetAccountListAsync();

			// Check if already in the list
			if (accounts.Any(account => account.SteamId == newAccount.SteamId)) return false;
			accounts.Add(newAccount);

			// If not add it and update
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(accounts));

			string pathAccountsFileJson = _pathFolderCache + "\\" + ACCOUNTS_FILENAME;
			File.WriteAllText(pathAccountsFileJson, json);

			return true;
		}

		public async Task<bool> RemoveAccountAsync(Account accountToRemove)
		{
			List<Account> accounts = await GetAccountListAsync();
			Account accountFromJson = accounts.FirstOrDefault(a => a.SteamId == accountToRemove.SteamId);
			if (accountFromJson == null) return false;
			accounts.Remove(accountFromJson);
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(accounts));
			string pathAccountsFileJson = _pathFolderCache + "\\" + ACCOUNTS_FILENAME;
			File.WriteAllText(pathAccountsFileJson, json);

			return true;
		}

		/// <summary>
		/// Remove a suspect from the list
		/// </summary>
		/// <param name="steamId"></param>
		/// <returns></returns>
		public async Task<bool> RemoveSuspectFromCache(string steamId)
		{
			List<string> ids = await GetSuspectsListFromCache();
			if (!ids.Contains(steamId)) return false;

			ids.Remove(steamId);
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(ids));
			string pathSuspectsFileJson = _pathFolderCache + "\\" + SUSPECT_FILENAME;
			File.WriteAllText(pathSuspectsFileJson, json);

			// If this suspect is in the banned suspects list, we remove it
			List<string> suspectBannedIdList = await GetSuspectsBannedList();
			if (suspectBannedIdList.Contains(steamId))
			{
				suspectBannedIdList.Remove(steamId);
				json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(suspectBannedIdList));
				pathSuspectsFileJson = _pathFolderCache + "\\" + SUSPECT_BANNED_FILENAME;
				File.WriteAllText(pathSuspectsFileJson, json);
			}

			return true;
		}

		/// <summary>
		/// Delete all JSON demos files from cache folder
		/// </summary>
		/// <returns></returns>
		public Task ClearDemosFile()
		{
			return Task.Run(() =>
			{
				string[] fileList = Directory.GetFiles(_pathFolderCache);

				foreach (string file in fileList)
				{
					if (File.Exists(file))
					{
						Match match = _demoFilePattern.Match(file);
						if (match.Success)
						{
							File.Delete(file);
						}
					}
				}
			});
		}

		/// <summary>
		/// Remove a specific demo from cache
		/// </summary>
		/// <returns></returns>
		public Task RemoveDemo(Demo demo)
		{
			return Task.Run(() =>
			{
				string path = _pathFolderCache + "\\" + demo.Id + ".json";
				if (File.Exists(path)) File.Delete(path);
			});
		}

		/// <summary>
		/// Create a backup file of all demos with custom data
		/// </summary>
		/// <param name="filePath">Backup file path</param>
		/// <returns></returns>
		public async Task CreateBackupCustomDataFile(string filePath)
		{
			List<Demo> demos = new List<Demo>();
			string[] fileList = Directory.GetFiles(_pathFolderCache);
			foreach (string file in fileList)
			{
				if (file != null)
				{
					Match match = _demoFilePattern.Match(Path.GetFileName(file));
					if (match.Success)
					{
						string json = File.ReadAllText(file);
						Demo demo = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<Demo>(json, new DemoBackupConverter()));
						if (demo != null) demos.Add(demo);
					}
				}
			}

			string jsonBackup = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(demos, new DemoListBackupConverter()));
			File.WriteAllText(filePath, jsonBackup);
		}

		/// <summary>
		/// Check if there is any demos in the cache folder
		/// </summary>
		/// <returns></returns>
		public bool ContainsDemos()
		{
			string[] fileList = Directory.GetFiles(_pathFolderCache);
			foreach (string file in fileList)
			{
				Match match = _demoFilePattern.Match(file);
				if (match.Success) return true;
			}
			return false;
		}

		public async Task<List<string>> GetFoldersAsync()
		{
			List<string> folders = new List<string>();
			string pathFoldersFileJson = _pathFolderCache + "\\" + FOLDERS_FILENAME;
			if (!File.Exists(pathFoldersFileJson))
			{
				folders = await InitCsgoFolders(folders);
			}
			else
			{
				string json = File.ReadAllText(pathFoldersFileJson);
				folders = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<string>>(json));
				if (!folders.Any())
				{
					folders = await InitCsgoFolders(folders);
				}
			}
			
			return folders;
		}

		public async Task<bool> AddFolderAsync(string path)
		{
			List<string> folders = await GetFoldersAsync();
			if (folders.Contains(path)) return false;
			folders.Add(path);
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(folders));
			string pathFoldersFileJson = _pathFolderCache + "\\" + FOLDERS_FILENAME;
			File.WriteAllText(pathFoldersFileJson, json);

			return true;
		}

		public async Task<bool> RemoveFolderAsync(string path)
		{
			List<string> folders = await GetFoldersAsync();
			if (!folders.Contains(path)) return false;
			folders.Remove(path);
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(folders));
			string pathFoldersFileJson = _pathFolderCache + "\\" + FOLDERS_FILENAME;
			File.WriteAllText(pathFoldersFileJson, json);

			return true;
		}

		/// <summary>
		/// Add the "csgo" and "replays" folders if they exist
		/// </summary>
		private async Task<List<string>> InitCsgoFolders(List<string> folders)
		{
			string csgoFolderPath = Path.GetFullPath(AppSettings.GetCsgoPath()).ToLower();
			if (Directory.Exists(csgoFolderPath)) folders.Add(csgoFolderPath);
			string replayFolderPath = Path.GetFullPath(csgoFolderPath + "/replays").ToLower();
			if (Directory.Exists(replayFolderPath)) folders.Add(replayFolderPath);

			if (folders.Any())
			{
				string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(folders));
				string pathFoldersFileJson = _pathFolderCache + "\\" + FOLDERS_FILENAME;
				File.WriteAllText(pathFoldersFileJson, json);
			}

			return folders;
		}
	}
}
