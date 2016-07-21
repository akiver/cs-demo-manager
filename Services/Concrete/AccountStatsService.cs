using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using Services.Interfaces;
using Services.Models.Charts;
using Services.Models.Stats;
using Player = Core.Models.Player;

namespace Services.Concrete
{
	public class AccountStatsService : IAccountStatsService
	{
		public long SelectedStatsAccountSteamId { get; set; }

		private readonly CacheService _cacheService = new CacheService();

		public Task<Demo> MapSelectedAccountValues(Demo demo, long accountSteamId = 0)
		{
			demo.WinStatus = GetWinStatus(demo, accountSteamId);

			Player player = demo.Players.FirstOrDefault(p => p.SteamId == accountSteamId);
			if (player != null)
			{
				demo.KillCount = player.KillCount;
				demo.OneKillCount = player.OneKillCount;
				demo.TwoKillCount = player.TwoKillCount;
				demo.ThreeKillCount = player.ThreeKillCount;
				demo.FourKillCount = player.FourKillCount;
				demo.FiveKillCount = player.FiveKillCount;
				demo.ClutchCount = player.ClutchCount;
				demo.AssistPerRound = player.AssistPerRound;
				demo.BombDefusedCount = player.BombDefusedCount;
				demo.BombExplodedCount = player.BombExplodedCount;
				demo.BombPlantedCount = player.BombPlantedCount;
				demo.CrouchKillCount = player.CrouchKillCount;
				demo.JumpKillCount = player.JumpKillCount;
				demo.TradeKillCount = player.TradeKillCount;
				demo.KillPerRound = player.KillPerRound;
				demo.DeathPerRound = player.DeathPerRound;
				demo.DamageHealthCount = player.TotalDamageHealthCount;
				demo.DamageArmorCount = player.TotalDamageArmorCount;
				demo.AverageHealthDamage = player.AverageHealthDamage;
				demo.AverageHltvRating = player.RatingHltv;
				demo.AverageEseaRws = player.EseaRws;
			}

			return Task.FromResult(demo);
		}

		public async Task<OverallStats> GetGeneralAccountStatsAsync()
		{
			OverallStats stats = new OverallStats();

			List<Demo> demos = await _cacheService.GetDemoListAsync();

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == SelectedStatsAccountSteamId) != null).ToList();
				if (demosPlayerList.Any())
				{
					stats.MatchCount = demosPlayerList.Count;
					foreach (Demo demo in demosPlayerList)
					{
						stats.KillCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).KillCount;
						stats.AssistCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).AssistCount;
						stats.DeathCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).DeathCount;
						stats.KnifeKillCount += demo.Kills.Count(k => k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Knife);
						stats.EntryKillCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).EntryKills.Count;
						stats.FiveKillCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).FiveKillCount;
						stats.FourKillCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).FourKillCount;
						stats.ThreeKillCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).ThreeKillCount;
						stats.TwoKillCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).TwoKillCount;
						stats.HeadshotCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).HeadshotCount;
						stats.BombDefusedCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).BombDefusedCount;
						stats.BombExplodedCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).BombExplodedCount;
						stats.BombPlantedCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).BombPlantedCount;
						stats.MvpCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).RoundMvpCount;
						stats.DamageCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).TotalDamageHealthCount;
						stats.RoundCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).RoundPlayedCount;
						stats.ClutchCount += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).ClutchCount;
						stats.ClutchWin += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).ClutchWonCount;
						stats.HltvRating += demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).RatingHltv;
						switch (GetWinStatus(demo, SelectedStatsAccountSteamId))
						{
							case "lost":
							case "lost-s":
								stats.MatchLossCount++;
								break;
							case "draw":
								stats.MatchDrawCount++;
								break;
							case "won":
							case "won-s":
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

			List<Demo> demos = await _cacheService.GetDemoListAsync();

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == SelectedStatsAccountSteamId) != null).ToList();
				if (demosPlayerList.Any())
				{
					stats.Dust2WinCount = demosPlayerList.Count(d => d.MapName == "de_dust2" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.Dust2LossCount = demosPlayerList.Count(d => d.MapName == "de_dust2" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.Dust2DrawCount = demosPlayerList.Count(d => d.MapName == "de_dust2" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
					int matchCount = stats.Dust2WinCount + stats.Dust2LossCount + stats.Dust2DrawCount;
					if (matchCount > 0)
					{
						stats.Dust2WinPercentage = Math.Round((stats.Dust2WinCount / (double)matchCount * 100), 2);
					}

					stats.MirageWinCount = demosPlayerList.Count(d => d.MapName == "de_mirage" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.MirageLossCount = demosPlayerList.Count(d => d.MapName == "de_mirage" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.MirageDrawCount = demosPlayerList.Count(d => d.MapName == "de_mirage" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
					matchCount = stats.MirageWinCount + stats.MirageLossCount + stats.MirageDrawCount;
					if (matchCount > 0)
					{
						stats.MirageWinPercentage = Math.Round((stats.MirageWinCount / (double)matchCount * 100), 2);
					}

					stats.InfernoWinCount = demosPlayerList.Count(d => d.MapName == "de_inferno" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.InfernoLossCount = demosPlayerList.Count(d => d.MapName == "de_inferno" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.InfernoDrawCount = demosPlayerList.Count(d => d.MapName == "de_inferno" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
					matchCount = stats.InfernoWinCount + stats.InfernoLossCount + stats.InfernoDrawCount;
					if (matchCount > 0)
					{
						stats.InfernoWinPercentage = Math.Round((stats.InfernoWinCount / (double)matchCount * 100), 2);
					}

					stats.TrainWinCount = demosPlayerList.Count(d => d.MapName == "de_train" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.TrainLossCount = demosPlayerList.Count(d => d.MapName == "de_train" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.TrainDrawCount = demosPlayerList.Count(d => d.MapName == "de_train" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
					matchCount = stats.TrainWinCount + stats.TrainLossCount + stats.TrainDrawCount;
					if (matchCount > 0)
					{
						stats.TrainWinPercentage = Math.Round((stats.TrainWinCount / (double)matchCount * 100), 2);
					}

					stats.OverpassWinCount = demosPlayerList.Count(d => d.MapName == "de_overpass" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.OverpassLossCount = demosPlayerList.Count(d => d.MapName == "de_overpass" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.OverpassDrawCount = demosPlayerList.Count(d => d.MapName == "de_overpass" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
					matchCount = stats.OverpassWinCount + stats.OverpassLossCount + stats.OverpassDrawCount;
					if (matchCount > 0)
					{
						stats.OverpassWinPercentage = Math.Round((stats.OverpassWinCount / (double)matchCount * 100), 2);
					}

					stats.CacheWinCount = demosPlayerList.Count(d => d.MapName == "de_cache" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.CacheLossCount = demosPlayerList.Count(d => d.MapName == "de_cache" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.CacheDrawCount = demosPlayerList.Count(d => d.MapName == "de_cache" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
					matchCount = stats.CacheWinCount + stats.CacheLossCount + stats.CacheDrawCount;
					if (matchCount > 0)
					{
						stats.CacheWinPercentage = Math.Round((stats.CacheWinCount / (double)matchCount * 100), 2);
					}

					stats.CobblestoneWinCount = demosPlayerList.Count(d => d.MapName == "de_cbble" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.CobblestoneLossCount = demosPlayerList.Count(d => d.MapName == "de_cbble" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.CobblestoneDrawCount = demosPlayerList.Count(d => d.MapName == "de_cbble" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
					matchCount = stats.CobblestoneWinCount + stats.CobblestoneLossCount + stats.CobblestoneDrawCount;
					if (matchCount > 0)
					{
						stats.CobblestoneWinPercentage = Math.Round((stats.CobblestoneWinCount / (double)matchCount * 100), 2);
					}

					stats.NukeWinCount = demosPlayerList.Count(d => d.MapName == "de_nuke" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == 2));
					stats.NukeLossCount = demosPlayerList.Count(d => d.MapName == "de_nuke" && (GetWinStatusCode(d, SelectedStatsAccountSteamId) == -1 || GetWinStatusCode(d, SelectedStatsAccountSteamId) == -2));
					stats.NukeDrawCount = demosPlayerList.Count(d => d.MapName == "de_nuke" && GetWinStatusCode(d, SelectedStatsAccountSteamId) == 0);
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
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == SelectedStatsAccountSteamId) != null).ToList();
				if (demosPlayerList.Any())
				{
					foreach (Demo demo in demosPlayerList)
					{
						// Rifles
						stats.KillAk47Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.AK47);
						stats.DeathAk47Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.AK47);

						stats.KillM4A4Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.M4A4);
						stats.DeathM4A4Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.M4A4);

						stats.KillM4A1Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.M4A1);
						stats.DeathM4A1Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.M4A1);

						stats.KillAugCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.AUG);
						stats.DeathAugCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.AUG);

						stats.KillGalilarCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Gallil);
						stats.DeathGalilarCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Gallil);

						stats.KillSg553Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.SG556);
						stats.DeathSg553Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.SG556);

						stats.KillFamasCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Famas);
						stats.DeathFamasCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Famas);

						// Snipers
						stats.KillAwpCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.AWP);
						stats.DeathAwpCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.AWP);

						stats.KillScoutCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Scout);
						stats.DeathScoutCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Scout);

						stats.KillScar20Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Scar20);
						stats.DeathScar20Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Scar20);

						stats.KillG3Sg1Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.G3SG1);
						stats.DeathG3Ssg1Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.G3SG1);

						// SMGs
						stats.KillMp7Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.MP7);
						stats.DeathMp7Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.MP7);

						stats.KillMp9Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.MP9);
						stats.DeathMp9Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.MP9);

						stats.KillP90Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.P90);
						stats.DeathP90Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.P90);

						stats.KillBizonCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Bizon);
						stats.DeathBizonCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Bizon);

						stats.KillMac10Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Mac10);
						stats.DeathMac10Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Mac10);

						stats.KillUmp45Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.UMP);
						stats.DeathUmp45Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.UMP);

						// Heavy
						stats.KillNovaCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Nova);
						stats.DeathNovaCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Nova);

						stats.KillXm1014Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.XM1014);
						stats.DeathXm1014Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.XM1014);

						stats.KillMag7Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Swag7);
						stats.DeathMag7Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Swag7);

						stats.KillSawedOffCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.SawedOff);
						stats.DeathSawedOffCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.SawedOff);

						stats.KillM249Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.M249);
						stats.DeathM249Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.M249);

						stats.KillNegevCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Negev);
						stats.DeathNegevCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Negev);

						// Pistols
						stats.KillGlockCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Glock);
						stats.DeathGlockCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Glock);

						stats.KillUspCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.USP);
						stats.DeathUspCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.USP);

						stats.KillP2000Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.P2000);
						stats.DeathP2000Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.P2000);

						stats.KillP250Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.P250);
						stats.DeathP250Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.P250);

						stats.KillCz75Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.CZ);
						stats.DeathCz75Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.CZ);

						stats.KillDeagleCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Deagle);
						stats.DeathDeagleCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Deagle);

						stats.KillDualEliteCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.DualBarettas);
						stats.DeathDualEliteCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.DualBarettas);

						stats.KillTec9Count +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Tec9);
						stats.DeathTec9Count +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Tec9);

						stats.KillFiveSevenCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.FiveSeven);
						stats.DeathFiveSevenCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.FiveSeven);

						// Equipment
						stats.KillHeGrenadeCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.HE);
						stats.DeathHeGrenadeCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.HE);

						stats.KillMolotovCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Molotov);
						stats.DeathMolotovCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Molotov);

						stats.KillIncendiaryCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Incendiary);
						stats.DeathIncendiaryCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Incendiary);

						stats.KillTazerCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Zeus);
						stats.DeathTazerCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Zeus);

						stats.KillKnifeCount +=
							demo.Kills.Count(
								k => k.KillerSteamId != 0 && k.KillerSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Knife);
						stats.DeathKnifeCount +=
							demo.Kills.Count(
								k => k.KilledSteamId != 0 && k.KilledSteamId == SelectedStatsAccountSteamId && k.Weapon.Element == EquipmentElement.Knife);

						stats.FlashbangThrownCount +=
							demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).FlashbangThrownCount;
						stats.SmokeThrownCount +=
							demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).SmokeThrownCount;
						stats.DecoyThrownCount +=
							demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).DecoyThrownCount;
						stats.HeGrenadeThrownCount +=
							demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).HeGrenadeThrownCount;
						stats.MolotovThrownCount +=
							demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).MolotovThrownCount;
						stats.IncendiaryThrownCount +=
							demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).IncendiaryThrownCount;
					}
				}
			}

			return stats;
		}

		public async Task<List<RankDateChart>> GetRankDateChartDataAsync()
		{
			List<RankDateChart> datas = new List<RankDateChart>();
			List<Demo> demos = await _cacheService.GetDemoListAsync(true);

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == SelectedStatsAccountSteamId) != null).ToList();
				if (demosPlayerList.Any())
				{
					// Sort by date
					demosPlayerList.Sort((d1, d2) => d1.Date.CompareTo(d2.Date));
					foreach (Demo demo in demosPlayerList)
					{
						// Ignore demos where all players have no rank, sometimes CCSUsrMsg_ServerRankUpdate isn't raised
						if (demo.Players.All(p => p.RankNumberOld != 0))
						{
							int newRankNumber = demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).RankNumberNew;
							int oldRankNumber = demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).RankNumberOld;
							int winCount = demo.Players.First(p => p.SteamId == SelectedStatsAccountSteamId).WinCount;
							datas.Add(new RankDateChart
							{
								Date = demo.Date,
								OldRank = oldRankNumber,
								NewRank = newRankNumber,
								WinCount = winCount,
								WinStatus = GetWinStatusCode(demo, SelectedStatsAccountSteamId)
							});
						}
					}
				}
			}

			return datas;
		}

		public async Task<ProgressStats> GetProgressStatsAsync()
		{
			ProgressStats stats = new ProgressStats();
			List<Demo> demos = await _cacheService.GetDemoListAsync(true);

			if (demos.Any())
			{
				List<Demo> demosPlayerList = demos.Where(demo => demo.Players.FirstOrDefault(p => p.SteamId == SelectedStatsAccountSteamId) != null).ToList();
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

						if (GetWinStatusCode(demo, SelectedStatsAccountSteamId) == 1 || GetWinStatusCode(demo, SelectedStatsAccountSteamId) == 2) winCount++;
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
						stats.Damage.Last().DamageCount = Math.Round((double)damageCount / matchCount, 2);
						stats.Kill.Last().KillAverage = Math.Round((double)killCount / matchCount, 1);
						stats.Kill.Last().DeathAverage = Math.Round((double)deathCount / matchCount, 1);

						foreach (KillEvent e in demo.Kills)
						{
							if (e.KillerSteamId == SelectedStatsAccountSteamId)
							{
								if (!velocityStats.ContainsKey(e.Weapon.Type)) velocityStats.Add(e.Weapon.Type, 0);
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
									case WeaponType.SMG:
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
						=> k.VelocityAverage).Concat(new[] { maximumVelocity }).Max();
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

		/// <summary>
		/// Return the result of the match for the SteamID
		/// -3 : player not found / error
		/// -2 : loss by surrender
		/// -1 : loss
		/// 0 : draw
		/// 1 : win
		/// 2 : win by surrender
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="accountSteamId"></param>
		/// <returns></returns>
		private static int GetWinStatusCode(Demo demo, long accountSteamId = 0)
		{
			if (accountSteamId == 0 || demo.ScoreTeam1 == 0 && demo.ScoreTeam2 == 0) return -3;

			Player player = demo.Players.FirstOrDefault(p => p.SteamId == accountSteamId);
			if (player == null) return -3;

			if (demo.Surrender != null)
			{
				player = demo.Surrender.Players.FirstOrDefault(p => p.SteamId == accountSteamId);
				if (player != null) return -2;
				return 2;
			}

			// was in CT?
			if (player.TeamName == demo.TeamCT.Name)
			{
				if (demo.ScoreTeam1 == demo.ScoreTeam2) return 0;
				if (demo.ScoreTeam1 > demo.ScoreTeam2) return 1;
				return -1;
			}

			// was in T?
			if (player.TeamName == demo.TeamT.Name)
			{
				if (demo.ScoreTeam1 == demo.ScoreTeam2) return 0;
				if (demo.ScoreTeam1 < demo.ScoreTeam2) return 1;
				return -1;
			}

			return -3;
		}

		private static string GetWinStatus(Demo demo, long accountSteamId = 0)
		{
			int code = GetWinStatusCode(demo, accountSteamId);
			switch (code)
			{
				case -1:
					return "lost";
				case -2:
					return "lost-s";
				case 0:
					return "draw";
				case 1:
					return "won";
				case 2:
					return "won-s";
				default:
					return string.Empty;
			}
		}
	}
}
