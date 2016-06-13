using System;
using CSGO_Demos_Manager.Models;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.messages.Protobuf;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Source;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Properties;
using CSGO_Demos_Manager.Services.Analyzer;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.Services.Serialization;
using DemoInfo;
using ICSharpCode.SharpZipLib.BZip2;
using MoreLinq;
using Newtonsoft.Json;
using ProtoBuf;

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
				List<string> whitelistIds =  await _cacheService.GetPlayersWhitelist();
				// Update player's flag
				foreach (Suspect suspect in enumerableSuspects)
				{
					PlayerExtended cheater = demo.Players.FirstOrDefault(p => p.SteamId.ToString() == suspect.SteamId);
					if (cheater != null && !whitelistIds.Contains(cheater.SteamId.ToString()))
					{
						if (Settings.Default.IgnoreLaterBan && DateTime.Now.AddDays(-suspect.DaySinceLastBanCount) < demo.Date)
							continue;
						if (suspect.GameBanCount > 0)
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

		private static async Task<Demo> GetDemoHeaderAsync(string demoFilePath)
		{
			Demo demo = await Task.Run(() => DemoAnalyzer.ParseDemoHeader(demoFilePath));
			if (demo != null)
			{
				// Update the demo name and path because it may be renamed / moved
				demo.Name = Path.GetFileName(demoFilePath);
				demo.Path = demoFilePath;
			}

			return demo;
		}

		public async Task<Demo> GetDemoDataAsync(Demo demo)
		{
			// If demo is in cache we retrieve its data
			bool demosIsCached = _cacheService.HasDemoInCache(demo);
			if (demosIsCached)
			{
				demo = await _cacheService.GetDemoDataFromCache(demo);
				demo.Source = Source.Factory(demo.SourceName);
			}
			return demo;
		}

		public async Task<List<Demo>> GetDemosHeader(List<string> folders, List<Demo> currentDemos = null, bool limit = false)
		{
			List<Demo> demos = new List<Demo>();
			List<Demo> demoKeeped = new List<Demo>();

			if (folders.Count > 0)
			{
				foreach (string folder in folders)
				{
					if (Directory.Exists(folder))
					{
						string[] files = Directory.GetFiles(folder, "*.dem");
						foreach (string file in files)
						{
							if (file.Contains("myassignedcase")) continue;
							var demo = await GetDemoHeaderAsync(file);
							if (demo != null)
							{
								if (!limit) demo = await GetDemoDataAsync(demo);
								if (currentDemos != null)
								{
									if (!currentDemos.Contains(demo)) demos.Add(demo);
								}
								else
								{
									if (!demos.Contains(demo)) demos.Add(demo);
								}
							}
						}
						if (limit)
						{
							// sort by date and keep the 50 first
							demos.Sort((d1, d2) => d1.Date.CompareTo(d2.Date));
							demoKeeped = demos.TakeLast(50).ToList();
							for (int i = 0; i < demoKeeped.Count; i++)
							{
								demoKeeped[i] = await GetDemoDataAsync(demoKeeped[i]);
							}
						}
					}
				}
			}

			return limit ? demoKeeped : demos;
		}

		public async Task<Demo> AnalyzeDemo(Demo demo, CancellationToken token)
		{
			if (!File.Exists(demo.Path))
			{
				// Demo may be moved to an other folder, just clear cache
				await _cacheService.RemoveDemo(demo);
			}

			DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);

			demo = await analyzer.AnalyzeDemoAsync(token);

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

		public async Task<Demo> AnalyzePlayersPosition(Demo demo, CancellationToken token)
		{
			if (!File.Exists(demo.Path))
			{
				// Demo may be moved to an other folder, just clear cache
				await _cacheService.RemoveDemo(demo);
			}

			DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
			analyzer.AnalyzePlayersPosition = true;

			demo = await analyzer.AnalyzeDemoAsync(token);

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

		public async Task<Rank> GetLastRankAccountStatsAsync(long steamId)
		{
			Rank lastRank = AppSettings.RankList[0];
			List<string> folders = await _cacheService.GetFoldersAsync();
			// Get only the demos header to have access to the demo's date
			List<Demo> demos = await GetDemosHeader(folders);
			if (demos.Any())
			{
				if (steamId == 0) steamId = Settings.Default.SelectedStatsAccountSteamID;
				if (steamId == 0) return lastRank;
				// keep only demos from valve where the account played
				List<Demo> newDemoList = demos.Where(d => d.SourceName == "valve"
				&& d.Players.FirstOrDefault(p => p.SteamId == steamId) != null)
				.ToList();
				if (newDemoList.Any())
				{
					// Sort by date and keep the more recent
					newDemoList.Sort((d1, d2) => d1.Date.CompareTo(d2.Date));
					Demo lastDemo = newDemoList.Last();
					// Get the new rank
					PlayerExtended player = lastDemo.Players.First(p => p.SteamId == steamId);
					lastRank = AppSettings.RankList.FirstOrDefault(r => r.Number == player.RankNumberNew);
					// Save it to the cache
					RankInfo rankInfo = new RankInfo
					{
						Number = player.RankNumberNew,
						SteamId = player.SteamId,
						LastDate = lastDemo.Date
					};
					await _cacheService.SaveLastRankInfoAsync(rankInfo);
				}
			}

			return lastRank;
		}

		public async Task<List<RankDateChart>> GetRankDateChartDataAsync()
		{
			List<RankDateChart> datas = new List<RankDateChart>();
			List<Demo> demos = await _cacheService.GetDemoListAsync(true);

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID) != null).ToList();
				if (demosPlayerList.Any())
				{
					// Sort by date
					demosPlayerList.Sort((d1, d2) => d1.Date.CompareTo(d2.Date));
					foreach (Demo demo in demosPlayerList)
					{
						// Ignore demos where all players have no rank, sometimes CCSUsrMsg_ServerRankUpdate isn't raised
						if (demo.Players.All(p => p.RankNumberOld != 0))
						{
							int newRankNumber = demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).RankNumberNew;
							int oldRankNumber = demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).RankNumberOld;
							int winCount = demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).WinCount;
							datas.Add(new RankDateChart
							{
								Date = demo.Date,
								OldRank = oldRankNumber,
								NewRank = newRankNumber,
								WinCount = winCount,
								WinStatus = demo.MatchVerdictSelectedAccountCount
							});
						}
					}
				}
			}

			return datas;
		}

		public async Task<OverallStats> GetGeneralAccountStatsAsync()
		{
			OverallStats stats = new OverallStats();

			List<Demo> demos = await _cacheService.GetDemoListAsync(true);

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID) != null).ToList();
				if (demosPlayerList.Any())
				{
					stats.MatchCount = demosPlayerList.Count;
					foreach (Demo demo in demosPlayerList)
					{
						stats.KillCount += demo.KillCount;
						stats.AssistCount += demo.AssistCount;
						stats.DeathCount += demo.DeathCount;
						stats.KnifeKillCount += demo.KnifeKillCount;
						stats.EntryKillCount += demo.EntryKillCount;
						stats.FiveKillCount += demo.FiveKillCount;
						stats.FourKillCount += demo.FourKillCount;
						stats.ThreeKillCount += demo.ThreeKillCount;
						stats.TwoKillCount += demo.TwoKillCount;
						stats.HeadshotCount += demo.HeadshotCount;
						stats.BombDefusedCount += demo.BombDefusedCount;
						stats.BombExplodedCount += demo.BombExplodedCount;
						stats.BombPlantedCount += demo.BombPlantedCount;
						stats.MvpCount += demo.MvpCount;
						stats.DamageCount += demo.DamageHealthCount;
						stats.RoundCount += demo.Rounds.Count;
						stats.ClutchCount += demo.ClutchCount;
						stats.ClutchWin += demo.ClutchWinCount;
						stats.HltvRating += demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).RatingHltv;
						switch (demo.MatchVerdictSelectedAccountCount)
						{
							case -1:
							case -2:
								stats.MatchLossCount++;
								break;
							case 0:
								stats.MatchDrawCount++;
								break;
							case 1:
							case 2:
								stats.MatchWinCount++;
								break;
						}
					}
				}

				if (stats.KillCount != 0 && stats.DeathCount != 0)
				{
					stats.KillDeathRatio = Math.Round(stats.KillCount / (decimal)stats.DeathCount, 2);
				}
				if (stats.KillCount != 0 && stats.HeadshotCount != 0)
				{
					stats.HeadshotRatio = Math.Round(((decimal)stats.HeadshotCount * 100) / stats.KillCount, 2);
				}
				if (stats.HltvRating > 0)
				{
					stats.HltvRating = Math.Round(stats.HltvRating / demosPlayerList.Count, 2);
				}
			}

			return stats;
		}

		public async Task<MapStats> GetMapStatsAsync()
		{
			MapStats stats = new MapStats();

			List<Demo> demos = await _cacheService.GetDemoListAsync(true);

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID) != null).ToList();
				if (demosPlayerList.Any())
				{
					stats.Dust2WinCount = demosPlayerList.Count(d => d.MapName == "de_dust2" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.Dust2LossCount = demosPlayerList.Count(d => d.MapName == "de_dust2" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.Dust2DrawCount = demosPlayerList.Count(d => d.MapName == "de_dust2" && d.MatchVerdictSelectedAccountCount == 0);
					int matchCount = stats.Dust2WinCount + stats.Dust2LossCount + stats.Dust2DrawCount;
					if (matchCount > 0)
					{
						stats.Dust2WinPercentage = Math.Round((stats.Dust2WinCount / (double)matchCount * 100), 2);
					}

					stats.MirageWinCount = demosPlayerList.Count(d => d.MapName == "de_mirage" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.MirageLossCount = demosPlayerList.Count(d => d.MapName == "de_mirage" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.MirageDrawCount = demosPlayerList.Count(d => d.MapName == "de_mirage" && d.MatchVerdictSelectedAccountCount == 0);
					matchCount = stats.MirageWinCount + stats.MirageLossCount + stats.MirageDrawCount;
					if (matchCount > 0)
					{
						stats.MirageWinPercentage = Math.Round((stats.MirageWinCount / (double)matchCount * 100), 2);
					}

					stats.InfernoWinCount = demosPlayerList.Count(d => d.MapName == "de_inferno" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.InfernoLossCount = demosPlayerList.Count(d => d.MapName == "de_inferno" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.InfernoDrawCount = demosPlayerList.Count(d => d.MapName == "de_inferno" && d.MatchVerdictSelectedAccountCount == 0);
					matchCount = stats.InfernoWinCount + stats.InfernoLossCount + stats.InfernoDrawCount;
					if (matchCount > 0)
					{
						stats.InfernoWinPercentage = Math.Round((stats.InfernoWinCount / (double)matchCount * 100), 2);
					}

					stats.TrainWinCount = demosPlayerList.Count(d => d.MapName == "de_train" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.TrainLossCount = demosPlayerList.Count(d => d.MapName == "de_train" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.TrainDrawCount = demosPlayerList.Count(d => d.MapName == "de_train" && d.MatchVerdictSelectedAccountCount == 0);
					matchCount = stats.TrainWinCount + stats.TrainLossCount + stats.TrainDrawCount;
					if (matchCount > 0)
					{
						stats.TrainWinPercentage = Math.Round((stats.TrainWinCount / (double)matchCount * 100), 2);
					}

					stats.OverpassWinCount = demosPlayerList.Count(d => d.MapName == "de_overpass" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.OverpassLossCount = demosPlayerList.Count(d => d.MapName == "de_overpass" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.OverpassDrawCount = demosPlayerList.Count(d => d.MapName == "de_overpass" && d.MatchVerdictSelectedAccountCount == 0);
					matchCount = stats.OverpassWinCount + stats.OverpassLossCount + stats.OverpassDrawCount;
					if (matchCount > 0)
					{
						stats.OverpassWinPercentage = Math.Round((stats.OverpassWinCount / (double)matchCount * 100), 2);
					}

					stats.CacheWinCount = demosPlayerList.Count(d => d.MapName == "de_cache" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.CacheLossCount = demosPlayerList.Count(d => d.MapName == "de_cache" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.CacheDrawCount = demosPlayerList.Count(d => d.MapName == "de_cache" && d.MatchVerdictSelectedAccountCount == 0);
					matchCount = stats.CacheWinCount + stats.CacheLossCount + stats.CacheDrawCount;
					if (matchCount > 0)
					{
						stats.CacheWinPercentage = Math.Round((stats.CacheWinCount / (double)matchCount * 100), 2);
					}

					stats.CobblestoneWinCount = demosPlayerList.Count(d => d.MapName == "de_cbble" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.CobblestoneLossCount = demosPlayerList.Count(d => d.MapName == "de_cbble" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.CobblestoneDrawCount = demosPlayerList.Count(d => d.MapName == "de_cbble" && d.MatchVerdictSelectedAccountCount == 0);
					matchCount = stats.CobblestoneWinCount + stats.CobblestoneLossCount + stats.CobblestoneDrawCount;
					if (matchCount > 0)
					{
						stats.CobblestoneWinPercentage = Math.Round((stats.CobblestoneWinCount / (double)matchCount * 100), 2);
					}

					stats.NukeWinCount = demosPlayerList.Count(d => d.MapName == "de_nuke" && (d.MatchVerdictSelectedAccountCount == 1 || d.MatchVerdictSelectedAccountCount == 2));
					stats.NukeLossCount = demosPlayerList.Count(d => d.MapName == "de_nuke" && (d.MatchVerdictSelectedAccountCount == -1 || d.MatchVerdictSelectedAccountCount == -2));
					stats.NukeDrawCount = demosPlayerList.Count(d => d.MapName == "de_nuke" && d.MatchVerdictSelectedAccountCount == 0);
					matchCount = stats.NukeWinCount + stats.NukeLossCount + stats.NukeDrawCount;
					if (matchCount > 0)
					{
						stats.NukeWinPercentage = Math.Round((stats.NukeWinCount / (double)matchCount * 100), 2);
					}
				}
			}

			return stats;
		}

		public async Task<WeaponStats> GetWeaponStatsAsync()
		{
			WeaponStats stats = new WeaponStats();

			List<Demo> demos = await _cacheService.GetDemoListAsync(true);

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID) != null).ToList();
				if (demosPlayerList.Any())
				{
					foreach (Demo demo in demosPlayerList)
					{
						// Rifles
						stats.KillAk47Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.AK47);
						stats.DeathAk47Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.AK47);

						stats.KillM4A4Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.M4A4);
						stats.DeathM4A4Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.M4A4);

						stats.KillM4A1Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.M4A1);
						stats.DeathM4A1Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.M4A1);

						stats.KillAugCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.AUG);
						stats.DeathAugCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.AUG);

						stats.KillGalilarCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Gallil);
						stats.DeathGalilarCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Gallil);

						stats.KillSg553Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.SG556);
						stats.DeathSg553Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.SG556);

						stats.KillFamasCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Famas);
						stats.DeathFamasCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Famas);

						// Snipers
						stats.KillAwpCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.AWP);
						stats.DeathAwpCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.AWP);

						stats.KillScoutCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Scout);
						stats.DeathScoutCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Scout);

						stats.KillScar20Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Scar20);
						stats.DeathScar20Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Scar20);

						stats.KillG3Sg1Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.G3SG1);
						stats.DeathG3Ssg1Count+=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.G3SG1);

						// SMGs
						stats.KillMp7Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.MP7);
						stats.DeathMp7Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.MP7);

						stats.KillMp9Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.MP9);
						stats.DeathMp9Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.MP9);

						stats.KillP90Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.P90);
						stats.DeathP90Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.P90);

						stats.KillBizonCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Bizon);
						stats.DeathBizonCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Bizon);

						stats.KillMac10Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Mac10);
						stats.DeathMac10Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Mac10);

						stats.KillUmp45Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.UMP);
						stats.DeathUmp45Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.UMP);

						// Heavy
						stats.KillNovaCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Nova);
						stats.DeathNovaCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Nova);

						stats.KillXm1014Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.XM1014);
						stats.DeathXm1014Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.XM1014);

						stats.KillMag7Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Swag7);
						stats.DeathMag7Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Swag7);

						stats.KillSawedOffCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.SawedOff);
						stats.DeathSawedOffCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.SawedOff);

						stats.KillM249Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.M249);
						stats.DeathM249Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.M249);

						stats.KillNegevCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Negev);
						stats.DeathNegevCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Negev);

						// Pistols
						stats.KillGlockCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Glock);
						stats.DeathGlockCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Glock);

						stats.KillUspCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.USP);
						stats.DeathUspCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.USP);

						stats.KillP2000Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.P2000);
						stats.DeathP2000Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.P2000);

						stats.KillP250Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.P250);
						stats.DeathP250Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.P250);

						stats.KillCz75Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.CZ);
						stats.DeathCz75Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.CZ);

						stats.KillDeagleCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Deagle);
						stats.DeathDeagleCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Deagle);

						stats.KillDualEliteCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.DualBarettas);
						stats.DeathDualEliteCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.DualBarettas);

						stats.KillTec9Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Tec9);
						stats.DeathTec9Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Tec9);

						stats.KillFiveSevenCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.FiveSeven);
						stats.DeathFiveSevenCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.FiveSeven);

						// Equipment
						stats.KillHeGrenadeCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.HE);
						stats.DeathHeGrenadeCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.HE);

						stats.KillMolotovCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Molotov);
						stats.DeathMolotovCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Molotov);

						stats.KillIncendiaryCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Incendiary);
						stats.DeathIncendiaryCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Incendiary);

						stats.KillTazerCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Zeus);
						stats.DeathTazerCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Zeus);

						stats.KillKnifeCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Knife);
						stats.DeathKnifeCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == Settings.Default.SelectedStatsAccountSteamID && k.Weapon.Element == EquipmentElement.Knife);

						stats.FlashbangThrownCount +=
							demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).FlashbangThrownCount;
						stats.SmokeThrownCount +=
							demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).SmokeThrownCount;
						stats.DecoyThrownCount +=
							demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).DecoyThrownCount;
						stats.HeGrenadeThrownCount +=
							demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).HeGrenadeThrownCount;
						stats.MolotovThrownCount +=
							demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).MolotovThrownCount;
						stats.IncendiaryThrownCount +=
							demo.Players.First(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID).IncendiaryThrownCount;
					}
				}
			}

			return stats;
		}

		public async Task<List<Demo>> GetDemosPlayer(string steamId)
		{
			List<Demo> result = new List<Demo>();

			List<Demo> demos = await _cacheService.GetDemoListAsync();

			if (demos.Any())
			{
				result = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId.ToString() == steamId) != null).ToList();
				for(int i = 0; i < result.Count; i++)
				{
					Demo demo = await GetDemoHeaderAsync(result[i].Path);
					if (demo != null) result[i] = demo;
				}
			}

			return result;
		}

		public async Task<ProgressStats> GetProgressStatsAsync()
		{
			ProgressStats stats = new ProgressStats();
			List<Demo> demos = await _cacheService.GetDemoListAsync(true);

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == Settings.Default.SelectedStatsAccountSteamID) != null).ToList();
				if (demosPlayerList.Any())
				{
					double maximumVelocity = 0;
					demosPlayerList.Sort((d1, d2) => d1.Date.CompareTo(d2.Date));
					DateTime currentDate = new DateTime(demosPlayerList[0].Date.Year, demosPlayerList[0].Date.Month, demosPlayerList[0].Date.Day);
					int matchCount = 0;
					int winCount = 0;
					int headshotCount = 0;
					int killCount = 0;
					int deathCount = 0;
					int damageCount = 0;
					int rifleKillCount = 0;
					int heavyKillCount = 0;
					int sniperKillCount = 0;
					int pistolKillCount = 0;
					int smgKillCount = 0;
					int crouchKillCount = 0;
					Dictionary<WeaponType, double> velocityStats = new Dictionary<WeaponType, double>();
					foreach (Demo demo in demosPlayerList)
					{
						matchCount++;
						DateTime demoDate = new DateTime(demo.Date.Year, demo.Date.Month, demo.Date.Day);
						if (demo.Equals(demosPlayerList.First()) || demo.Equals(demosPlayerList.Last())
							|| demoDate >= currentDate.AddDays(7))
						{
							stats.Win.Add(new WinDateChart
							{
								Date = demoDate,
								WinPercentage = 0
							});
							stats.HeadshotRatio.Add(new HeadshotDateChart
							{
								Date = demoDate,
								HeadshotPercentage = 0
							});
							stats.Damage.Add(new DamageDateChart
							{
								Date = demoDate,
								DamageCount = 0
							});
							stats.Kill.Add(new KillDateChart
							{
								Date = demoDate,
								KillAverage = 0,
								DeathAverage = 0
							});
							stats.KillVelocityRifle.Add(new KillVelocityChart
							{
								Date = demoDate,
								VelocityAverage = 0
							});
							stats.KillVelocityPistol.Add(new KillVelocityChart
							{
								Date = demoDate,
								VelocityAverage = 0
							});
							stats.KillVelocitySmg.Add(new KillVelocityChart
							{
								Date = demoDate,
								VelocityAverage = 0
							});
							stats.KillVelocitySniper.Add(new KillVelocityChart
							{
								Date = demoDate,
								VelocityAverage = 0
							});
							stats.KillVelocityHeavy.Add(new KillVelocityChart
							{
								Date = demoDate,
								VelocityAverage = 0
							});
							stats.CrouchKill.Add(new CrouchKillDateChart
							{
								Date = demoDate,
								CrouchKillPercentage = 0
							});

							currentDate = demoDate;
							matchCount = 1;
							winCount = 0;
							headshotCount = 0;
							killCount = 0;
							deathCount = 0;
							damageCount = 0;
							rifleKillCount = 0;
							heavyKillCount = 0;
							sniperKillCount = 0;
							pistolKillCount = 0;
							smgKillCount = 0;
							crouchKillCount = 0;
							velocityStats.Clear();
						}

						if (demo.MatchVerdictSelectedAccountCount == 1 || demo.MatchVerdictSelectedAccountCount == 2) winCount++;
						if (winCount > 0) stats.Win.Last().WinPercentage = Math.Round((winCount / (double)matchCount * 100), 2);
						headshotCount += demo.HeadshotCount;
						killCount += demo.KillCount;
						deathCount += demo.DeathCount;
						damageCount += demo.DamageHealthCount;
						crouchKillCount += demo.CrouchKillCount;

						if (killCount > 0)
						{
							stats.HeadshotRatio.Last().HeadshotPercentage = Math.Round((headshotCount / (double)killCount * 100), 2);
							stats.CrouchKill.Last().CrouchKillPercentage = Math.Round((crouchKillCount / (double)killCount * 100), 2);
						}
						stats.Damage.Last().DamageCount = Math.Round((double)damageCount/ matchCount, 2);
						stats.Kill.Last().KillAverage = Math.Round((double)killCount/ matchCount, 1);
						stats.Kill.Last().DeathAverage = Math.Round((double)deathCount / matchCount, 1);

						foreach (KillEvent e in demo.Kills)
						{
							if (e.KillerSteamId == Settings.Default.SelectedStatsAccountSteamID)
							{
								if(!velocityStats.ContainsKey(e.Weapon.Type)) velocityStats.Add(e.Weapon.Type, 0);
								switch (e.Weapon.Type)
								{
									case WeaponType.Rifle:
										rifleKillCount++;
										break;
									case WeaponType.Heavy:
										heavyKillCount++;
										break;
									case WeaponType.Pistol:
										pistolKillCount++;
										break;
									case  WeaponType.SMG:
										smgKillCount++;
										break;
									case WeaponType.Sniper:
										sniperKillCount++;
										break;
								}
								velocityStats[e.Weapon.Type] += Math.Abs(e.KillerVelocityY + e.KillerVelocityX + e.KillerVelocityZ);
							}
						}

						if (velocityStats.ContainsKey(WeaponType.Rifle))
							stats.KillVelocityRifle.Last().VelocityAverage = Math.Round(velocityStats[WeaponType.Rifle] / rifleKillCount, 1);
						if (velocityStats.ContainsKey(WeaponType.Pistol))
							stats.KillVelocityPistol.Last().VelocityAverage = Math.Round(velocityStats[WeaponType.Pistol] / pistolKillCount, 1);
						if (velocityStats.ContainsKey(WeaponType.Sniper))
							stats.KillVelocitySniper.Last().VelocityAverage = Math.Round(velocityStats[WeaponType.Sniper] / sniperKillCount, 1);
						if (velocityStats.ContainsKey(WeaponType.SMG))
							stats.KillVelocitySmg.Last().VelocityAverage = Math.Round(velocityStats[WeaponType.SMG] / smgKillCount, 1);
						if (velocityStats.ContainsKey(WeaponType.Heavy))
							stats.KillVelocityHeavy.Last().VelocityAverage = Math.Round(velocityStats[WeaponType.Heavy] / heavyKillCount, 1);
					}
					maximumVelocity = stats.KillVelocityPistol.Select(k
						=> k.VelocityAverage).Concat(new[] {maximumVelocity}).Max();
					maximumVelocity = stats.KillVelocityRifle.Select(k
						=> k.VelocityAverage).Concat(new[] { maximumVelocity }).Max();
					maximumVelocity = stats.KillVelocityHeavy.Select(k
						=> k.VelocityAverage).Concat(new[] { maximumVelocity }).Max();
					maximumVelocity = stats.KillVelocitySmg.Select(k
						=> k.VelocityAverage).Concat(new[] { maximumVelocity }).Max();
					maximumVelocity = stats.KillVelocitySniper.Select(k
						=> k.VelocityAverage).Concat(new[] { maximumVelocity }).Max();
					stats.MaximumVelocity = maximumVelocity;
				}
			}

			return stats;
		}

		public async Task<bool> DeleteDemo(Demo demo)
		{
			if (!File.Exists(demo.Path)) return false;
			await _cacheService.RemoveDemo(demo);
			if (File.Exists(demo.Path + ".info")) File.Delete(demo.Path + ".info");
			File.Delete(demo.Path);

			return true;
		}

		public async Task<bool> DownloadDemo(string url, string demoName)
		{
			using (WebClient webClient = new WebClient())
			{
				try
				{
					string location = Settings.Default.DownloadFolder + Path.DirectorySeparatorChar + demoName + ".bz2";
					Uri uri = new Uri(url);
					await Task.Factory.StartNew(() => webClient.DownloadFile(uri, location));
					return true;
				}
				catch (Exception e)
				{
					Logger.Instance.Log(e);
					return false;
				}
			}
		}

		public async Task<bool> DecompressDemoArchive(string demoName)
		{
			string archivePath = Settings.Default.DownloadFolder + Path.DirectorySeparatorChar + demoName + ".bz2";
			string destination = Settings.Default.DownloadFolder + Path.DirectorySeparatorChar + demoName + ".dem";
			if (!File.Exists(archivePath)) return false;
			await Task.Factory.StartNew(() => BZip2.Decompress(File.OpenRead(archivePath), File.Create(destination), true));
			File.Delete(archivePath);
			return true;
		}

		public async Task<Dictionary<string, string>> GetDemoListUrl()
		{
			Dictionary<string, string> demoUrlList = new Dictionary<string, string>();

			string filePath = AppSettings.GetMatchListDataFilePath();
			if (File.Exists(filePath))
			{
				using (FileStream file = File.OpenRead(filePath))
				{
					try
					{
						CMsgGCCStrike15_v2_MatchList matchList = Serializer.Deserialize<CMsgGCCStrike15_v2_MatchList>(file);
						foreach (CDataGCCStrike15_v2_MatchInfo matchInfo in matchList.matches)
						{
							// old definition
							if (matchInfo.roundstats_legacy != null)
							{
								CMsgGCCStrike15_v2_MatchmakingServerRoundStats roundStats = matchInfo.roundstats_legacy;
								await ProcessRoundStats(matchInfo, roundStats, demoUrlList);
							}
							else
							{
								// new definition
								List<CMsgGCCStrike15_v2_MatchmakingServerRoundStats> roundStatsList = matchInfo.roundstatsall;
								foreach (CMsgGCCStrike15_v2_MatchmakingServerRoundStats roundStats in roundStatsList)
								{
									await ProcessRoundStats(matchInfo, roundStats, demoUrlList);
								}
							}
						}
					}
					catch (Exception e)
					{
						Logger.Instance.Log(e);
					}
				}
			}

			return demoUrlList;
		}

		/// <summary>
		/// Check if the round stats contains useful information and in this case do the work
		/// 1. Check if the demo archive is still available
		/// 2. Create the .info file
		/// 3. Add the demo to the download list
		/// </summary>
		/// <param name="matchInfo"></param>
		/// <param name="roundStats"></param>
		/// <param name="demoUrlList"></param>
		/// <returns></returns>
		private static async Task ProcessRoundStats(CDataGCCStrike15_v2_MatchInfo matchInfo, CMsgGCCStrike15_v2_MatchmakingServerRoundStats roundStats, Dictionary<string, string> demoUrlList)
		{
			string demoName = GetDemoName(matchInfo, roundStats);
			if (roundStats.reservationid != 0 && roundStats.map != null)
			{
				if (await IsDownloadRequired(demoName, roundStats.map))
				{
					if (SerializeMatch(matchInfo, demoName))
					{
						demoUrlList.Add(demoName, roundStats.map);
					}
				}
			}
		}

		/// <summary>
		/// Create the .info file
		/// </summary>
		/// <param name="matchInfo"></param>
		/// <param name="demoName"></param>
		/// <returns></returns>
		private static bool SerializeMatch(CDataGCCStrike15_v2_MatchInfo matchInfo, string demoName)
		{
			string infoFilePath = Settings.Default.DownloadFolder + Path.DirectorySeparatorChar + demoName + ".dem.info";
			try
			{
				using (FileStream fs = File.Create(infoFilePath))
				{
					Serializer.Serialize(fs, matchInfo);
				}
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
				return false;
			}

			return true;
		}

		/// <summary>
		/// Return the demo name
		/// </summary>
		/// <param name="matchInfo"></param>
		/// <param name="roundStats"></param>
		/// <returns></returns>
		private static string GetDemoName(CDataGCCStrike15_v2_MatchInfo matchInfo,
			CMsgGCCStrike15_v2_MatchmakingServerRoundStats roundStats)
		{
			return "match730_" + string.Format("{0,21:D21}", roundStats.reservationid) + "_"
				+ string.Format("{0,10:D10}", matchInfo.watchablematchinfo.tv_port) + "_"
				+ matchInfo.watchablematchinfo.server_ip;
		}

		/// <summary>
		/// Check if:
		/// - The demo archive is still available
		/// - The .dem and .info files already exists
		/// </summary>
		/// <param name="demoName"></param>
		/// <param name="demoArchiveUrl"></param>
		/// <returns></returns>
		private static async Task<bool> IsDownloadRequired(string demoName, string demoArchiveUrl)
		{
			bool result = await CheckIfArchiveIsAvailable(demoArchiveUrl);
			string[] fileList = new DirectoryInfo(Settings.Default.DownloadFolder).GetFiles().Select(o => o.Name).ToArray();
			if (fileList.Contains(demoName + ".dem") && fileList.Contains(demoName + ".dem.info")) result = false;

			return result;
		}

		/// <summary>
		/// Check if the URL doesn't return a 404
		/// </summary>
		/// <param name="url"></param>
		/// <returns></returns>
		private static async Task<bool> CheckIfArchiveIsAvailable(string url)
		{
			try
			{
				HttpWebRequest request = WebRequest.Create(url) as HttpWebRequest;
				request.Method = "HEAD";
				HttpWebResponse response = await request.GetResponseAsync() as HttpWebResponse;
				response.Close();
				return response.StatusCode == HttpStatusCode.OK;
			}
			catch
			{
				return false;
			}
		}
	}
}
