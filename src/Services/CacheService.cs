using System;
using CSGO_Demos_Manager.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
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

		private readonly Regex _demoFilePattern = new Regex("^(.*?)([_])([^0-9]*)([0-9]*)(.json)$");

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
			_settingsJson.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
			_settingsJson.PreserveReferencesHandling = PreserveReferencesHandling.Objects;
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

			Demo demoFromJson = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<Demo>(json));

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

			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(demo, _settingsJson));

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
			// If not add it
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(ids, _settingsJson));

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
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(ids, _settingsJson));

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
		/// Remove a suspect from the list
		/// </summary>
		/// <param name="steamId"></param>
		/// <returns></returns>
		public async Task<bool> RemoveSuspectFromCache(string steamId)
		{
			List<string> ids = await GetSuspectsListFromCache();
			if (!ids.Contains(steamId)) return false;

			ids.Remove(steamId);
			string json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(ids, _settingsJson));
			string pathSuspectsFileJson = _pathFolderCache + "\\" + SUSPECT_FILENAME;
			File.WriteAllText(pathSuspectsFileJson, json);

			// If this suspect is in the banned suspects list, we remove it
			List<string> suspectBannedIdList = await GetSuspectsBannedList();
			if (suspectBannedIdList.Contains(steamId))
			{
				suspectBannedIdList.Remove(steamId);
				json = await Task.Factory.StartNew(() => JsonConvert.SerializeObject(suspectBannedIdList, _settingsJson));
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
				Match match = _demoFilePattern.Match(file);
				if (match.Success)
				{
					string json = File.ReadAllText(file);
					Demo demo = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<Demo>(json, new DemoBackupConverter()));
					if (demo != null) demos.Add(demo);
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
	}
}
