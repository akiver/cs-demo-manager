using CSGO_Demos_Manager.Models;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.IO;
using System.Linq;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Source;
using CSGO_Demos_Manager.Properties;
using CSGO_Demos_Manager.Services.Analyzer;
using CSGO_Demos_Manager.Services.Serialization;
using MoreLinq;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Services
{
	public class DemosService : IDemosService
	{
		private readonly CacheService _cacheService = new CacheService();

		private readonly ISteamService _steamService;

		public DemosService(ISteamService steamService)
		{
			_steamService = steamService;
		}

		/// <summary>
		/// Check if there are banned players and update their banned flags
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		public async Task<Demo> AnalyzeBannedPlayersAsync(Demo demo)
		{
			List<string> ids = demo.Players.Select(playerExtended => playerExtended.SteamId.ToString()).ToList();
			IEnumerable<Suspect> suspects = await _steamService.GetBanStatusForUserList(ids);
			var enumerableSuspects = suspects as IList<Suspect> ?? suspects.ToList();
			if (enumerableSuspects.Any())
			{
				// Update player's flag
				foreach (Suspect suspect in enumerableSuspects)
				{
					PlayerExtended cheater = demo.Players.FirstOrDefault(p => p.SteamId.ToString() == suspect.SteamId);
					if (cheater != null)
					{
						if (suspect.CommunityBanned)
						{
							demo.HasCheater = true;
							cheater.IsOverwatchBanned = true;
						}
						if (suspect.VacBanned)
						{
							demo.HasCheater = true;
							cheater.IsVacBanned = true;
						}
					}
				}
			}
			return demo;
		}

		private async Task<Demo> GetDemoHeaderAsync(string demoFilePath)
		{
			var demo = await Task.Run(() => DemoAnalyzer.ParseDemoHeader(demoFilePath));
			if (demo == null) return null;

			// If demo is in cache we retrieve its data
			bool demosIsCached = _cacheService.HasDemoInCache(demo);
			if (demosIsCached)
			{
				demo = await _cacheService.GetDemoDataFromCache(demo);
				demo.Source = Source.Factory(demo.SourceName);
				// Update the demo name and path because it may be renamed / moved
				demo.Name = Path.GetFileName(demoFilePath);
				demo.Path = demoFilePath;
			}
			return demo;
		}

		public async Task<List<Demo>> GetDemosHeader(List<string> folders)
		{
			List<Demo> demos = new List<Demo>();

			if (folders.Count > 0)
			{
				foreach (string folder in folders)
				{
					if (Directory.Exists(folder))
					{
						string[] files = Directory.GetFiles(folder, "*.dem");
						foreach (string file in files)
						{
							var demo = await GetDemoHeaderAsync(file);
							if (demo != null && !demos.Contains(demo)) demos.Add(demo);
						}
					}
				}
			}
			return demos;
		}

		public async Task<Demo> AnalyzeDemo(Demo demo)
		{
			if (!File.Exists(demo.Path))
			{
				// Demo may be moved to an other folder, just clear cache
				await _cacheService.RemoveDemo(demo);
			}

			DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
			
			demo = await analyzer.AnalyzeDemoAsync();

			return demo;
		}

		public async Task SaveComment(Demo demo, string comment)
		{
			demo.Comment = comment;
			await _cacheService.WriteDemoDataCache(demo);
		}

		public async Task SaveStatus(Demo demo, string status)
		{
			demo.Status = status;
			await _cacheService.WriteDemoDataCache(demo);
		}

		public async Task SetSource(ObservableCollection<Demo> demos, string source)
		{
			foreach (Demo demo in demos.Where(demo => demo.Type != "POV"))
			{
				switch (source)
				{
					case "valve":
						demo.Source = new Valve();
						break;
					case "esea":
						demo.Source = new Esea();
						break;
					case "ebot":
						demo.Source = new Ebot();
						break;
					case "faceit":
						demo.Source = new Faceit();
						break;
					case "cevo":
						demo.Source = new Cevo();
						break;
					default:
						demo.Source = new Valve();
						break;
				}
				await _cacheService.WriteDemoDataCache(demo);
			}
		}

		public async Task<Demo> AnalyzePlayersPosition(Demo demo)
		{
			if (!File.Exists(demo.Path))
			{
				// Demo may be moved to an other folder, just clear cache
				await _cacheService.RemoveDemo(demo);
			}

			DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
			analyzer.AnalyzePlayersPosition = true;

			demo = await analyzer.AnalyzeDemoAsync();

			await _cacheService.WriteDemoDataCache(demo);

			return demo;
		}

		public async Task<Demo> AnalyzeHeatmapPoints(Demo demo)
		{
			if (!File.Exists(demo.Path))
			{
				// Demo may be moved to an other folder, just clear cache
				await _cacheService.RemoveDemo(demo);
			}

			DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
			analyzer.AnalyzeHeatmapPoint = true;

			demo = await analyzer.AnalyzeDemoAsync();

			await _cacheService.WriteDemoDataCache(demo);

			return demo;
		}

		/// <summary>
		/// Return demos from JSON backup file
		/// </summary>
		/// <returns></returns>
		public async Task<List<Demo>> GetDemosFromBackup(string jsonFile)
		{
			List<Demo> demos = new List<Demo>();
			if (File.Exists(jsonFile))
			{
				string json = File.ReadAllText(jsonFile);
				demos = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Demo>>(json, new DemoListBackupConverter()));
			}
			return demos;
		}

		public async Task<Rank> GetLastRankAccountStatsAsync()
		{
			Rank rank = AppSettings.RankList[0];
			List<Demo> demos = await _cacheService.GetDemoListAsync();
			if (demos.Any())
			{
				// demos where account played
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID) != null).ToList();
				if (demosPlayerList.Any())
				{
					Demo lastDemo = demosPlayerList.MaxBy(d => d.Date);
					int rankNumber = lastDemo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).RankNumberNew;
					rank = AppSettings.RankList.First(r => r.Number == rankNumber);
				}
			}

			return rank;
		}

		public async Task<List<RankDateChart>> GetRankDateChartDataAsync()
		{
			List<RankDateChart> datas = new List<RankDateChart>();
			List<Demo> demos = await _cacheService.GetDemoListAsync();

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID) != null).ToList();
				if (demosPlayerList.Any())
				{
					foreach (Demo demo in demosPlayerList)
					{
						int rankNumber = demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).RankNumberNew;
						datas.Add(new RankDateChart
						{
							Date = demo.Date,
							Rank = AppSettings.RankList.First(r => r.Number == rankNumber).Number
						});
					}
				}
			}

			return datas;
		}
	}
}
