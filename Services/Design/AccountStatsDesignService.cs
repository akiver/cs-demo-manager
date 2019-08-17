using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Interfaces;
using Services.Models.Charts;
using Services.Models.Stats;

namespace Services.Design
{
	public class AccountStatsDesignService : IAccountStatsService
	{
		public long SelectedStatsAccountSteamId { get; set; }

		public Task<Demo> MapSelectedAccountValues(Demo demo, long accountSteamId)
		{
			return Task.FromResult(demo);
		}

		public Task<List<RankDateChart>> GetRankDateChartDataAsync(List<Demo> demos, string scale)
		{
			Random ran = new Random();
			return Task.FromResult(new List<RankDateChart>
			{
				new RankDateChart
				{
					Date = DateTime.Now,
					NewRank = 1,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(1),
					NewRank = 2,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(2),
					NewRank = 3,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(3),
					NewRank = 4,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(4),
					NewRank = 4,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(5),
					NewRank = 3,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(6),
					NewRank = 4,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(7),
					NewRank = 5,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(8),
					NewRank = 6,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(9),
					NewRank = 7,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(10),
					NewRank = 8,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(11),
					NewRank = 9,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(12),
					NewRank = 10,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(13),
					NewRank = 11,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(14),
					NewRank = 11,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(15),
					NewRank = 11,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(16),
					NewRank = 12,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(17),
					NewRank = 13,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(18),
					NewRank = 13,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(19),
					NewRank = 14,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(20),
					NewRank = 14,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(21),
					NewRank = 15,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(22),
					NewRank = 16,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(23),
					NewRank = 17,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(24),
					NewRank = 18,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(25),
					NewRank = 18,
					WinStatus = ran.Next(3)
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(26),
					NewRank = 18,
					WinStatus = ran.Next(3)
				}
			});
		}

		public Task<OverallStats> GetGeneralAccountStatsAsync(List<Demo> demos)
		{
			return Task.FromResult(new OverallStats
			{
				KillCount = 2450,
				MatchCount = 214,
				DeathCount = 2000,
				HeadshotRatio = (decimal)42.5,
				HeadshotCount = 1100,
				KillDeathRatio = (decimal)1.1,
				KnifeKillCount = 10,
				AssistCount = 1500,
				EntryKillCount = 620,
				FiveKillCount = 15,
				FourKillCount = 20,
				ThreeKillCount = 46,
				TwoKillCount = 62,
				BombDefusedCount = 51,
				BombExplodedCount = 48,
				BombPlantedCount = 110,
				MvpCount = 620,
				DamageCount = 122241,
				MatchWinCount = 60,
				MatchLossCount = 15,
				MatchDrawCount = 7,
				ClutchCount = 50,
				ClutchWin = 36,
				RoundCount = 100
			});
		}

		public Task<MapStats> GetMapStatsAsync(List<Demo> demos)
		{
			return Task.FromResult(new MapStats
			{
				Dust2WinCount = 24,
				Dust2LossCount = 10,
				Dust2DrawCount = 6,
				Dust2WinPercentage = 50,
				NukeWinCount = 12,
				NukeLossCount = 2,
				NukeDrawCount = 5,
				NukeWinPercentage = 40,
				MirageWinCount = 12,
				MirageLossCount = 1,
				MirageDrawCount = 6,
				MirageWinPercentage = 62,
				CacheWinCount = 13,
				CacheLossCount = 10,
				CacheDrawCount = 5,
				CacheWinPercentage = 30,
				CobblestoneWinCount = 3,
				CobblestoneLossCount = 2,
				CobblestoneDrawCount = 2,
				CobblestoneWinPercentage = 41,
				VertigoWinCount = 2,
				VertigoLossCount = 7,
				VertigoDrawCount = 1,
				VertigoWinPercentage = 20,
				TrainWinCount = 4,
				TrainLossCount = 0,
				TrainDrawCount = 5,
				TrainWinPercentage = 20,
				InfernoWinCount = 14,
				InfernoLossCount = 2,
				InfernoDrawCount = 14,
				InfernoWinPercentage = 54,
				OverpassWinCount = 9,
				OverpassLossCount = 7,
				OverpassDrawCount = 8,
				OverpassWinPercentage = 70
			});
		}

		public Task<WeaponStats> GetWeaponStatsAsync(List<Demo> demos)
		{
			return Task.FromResult(new WeaponStats
			{
				KillAk47Count = 1452,
				DeathAk47Count = 523,
				KillM4A4Count = 1489,
				DeathM4A4Count = 254,
				KillM4A1Count = 2154,
				DeathM4A1Count = 454,
				KillAugCount = 1581,
				DeathAugCount = 514,
				KillGalilarCount = 87,
				DeathGalilarCount = 152,
				KillSg553Count = 1489,
				DeathSg553Count = 520,
				KillFamasCount = 5457,
				DeathFamasCount = 36,
				KillAwpCount = 984,
				DeathAwpCount = 15,
				KillScoutCount = 541,
				DeathScoutCount = 85,
				KillScar20Count = 357,
				DeathScar20Count = 159,
				KillG3Sg1Count = 87,
				DeathG3Ssg1Count = 3,
				KillMp7Count = 65,
				DeathMp7Count = 14,
				KillMp9Count = 878,
				DeathMp9Count = 14,
				KillMac10Count = 258,
				DeathMac10Count = 123,
				KillBizonCount = 458,
				DeathBizonCount = 156,
				KillP90Count = 14,
				DeathP90Count = 147,
				KillUmp45Count = 57,
				DeathUmp45Count = 51,
				KillNovaCount = 56,
				DeathNovaCount = 87,
				KillXm1014Count = 25,
				DeathXm1014Count = 74,
				KillSawedOffCount = 87,
				DeathSawedOffCount = 25,
				KillMag7Count = 36,
				DeathMag7Count = 95,
				KillM249Count = 57,
				DeathM249Count = 52,
				KillNegevCount = 44,
				DeathNegevCount = 21,
				KillCz75Count = 47,
				DeathCz75Count = 32,
				KillP2000Count = 15,
				DeathP2000Count = 5,
				KillP250Count = 68,
				DeathP250Count = 32,
				KillDeagleCount = 125,
				DeathDeagleCount = 68,
				KillGlockCount = 159,
				DeathGlockCount = 654,
				KillDualEliteCount = 78,
				DeathDualEliteCount = 23,
				KillUspCount = 49,
				DeathUspCount = 57,
				KillFiveSevenCount = 154,
				DeathFiveSevenCount = 36,
				KillTec9Count = 84,
				DeathTec9Count = 59,
				KillHeGrenadeCount = 120,
				DeathHeGrenadeCount = 10,
				KillMolotovCount = 145,
				DeathMolotovCount = 15,
				KillIncendiaryCount = 32,
				DeathIncendiaryCount = 14,
				KillTazerCount = 12,
				DeathTazerCount = 1,
				KillKnifeCount = 20,
				DeathKnifeCount = 5,
				FlashbangThrownCount = 352,
				SmokeThrownCount = 1456,
				DecoyThrownCount = 354,
				HeGrenadeThrownCount = 452,
				MolotovThrownCount = 236,
				IncendiaryThrownCount = 25
			});
		}

		public Task<ProgressStats> GetProgressStatsAsync(List<Demo> demos)
		{
			return Task.FromResult(new ProgressStats
			{
				Win = new List<WinDateChart>
				{
					new WinDateChart
					{
						Date = DateTime.Now,
						WinPercentage = 50
					},
					new WinDateChart
					{
						Date = DateTime.Now.AddMonths(1),
						WinPercentage = 20
					},
					new WinDateChart
					{
						Date = DateTime.Now.AddMonths(2),
						WinPercentage = 60
					},
					new WinDateChart
					{
						Date = DateTime.Now.AddMonths(3),
						WinPercentage = 10.5
					},
					new WinDateChart
					{
						Date = DateTime.Now.AddMonths(4),
						WinPercentage = 70.5
					},
				},
				Kill = new List<KillDateChart>
				{
					new KillDateChart
					{
						Date = DateTime.Today,
						KillAverage = 21,
						DeathAverage = 20
					},
					new KillDateChart
					{
						Date = DateTime.Today.AddMonths(1),
						KillAverage = 35,
						DeathAverage = 15
					},
					new KillDateChart
					{
						Date = DateTime.Today.AddMonths(2),
						KillAverage = 50,
						DeathAverage = 32
					},
					new KillDateChart
					{
						Date = DateTime.Today.AddMonths(3),
						KillAverage = 50,
						DeathAverage = 21
					},
				},
				Damage = new List<DamageDateChart>
				{
					new DamageDateChart
					{
						Date = DateTime.Today,
						DamageCount = 1252
					},
					new DamageDateChart
					{
						Date = DateTime.Today.AddMonths(1),
						DamageCount = 1600
					},
					new DamageDateChart
					{
						Date = DateTime.Today.AddMonths(2),
						DamageCount = 1400
					},
					new DamageDateChart
					{
						Date = DateTime.Today.AddMonths(3),
						DamageCount = 1000
					},
				},
				HeadshotRatio = new List<HeadshotDateChart>
				{
					new HeadshotDateChart
					{
						Date = DateTime.Today,
						HeadshotPercentage = 30.4
					},
					new HeadshotDateChart
					{
						Date = DateTime.Today.AddMonths(1),
						HeadshotPercentage = 50
					},
					new HeadshotDateChart
					{
						Date = DateTime.Today.AddMonths(3),
						HeadshotPercentage = 54.5
					},
					new HeadshotDateChart
					{
						Date = DateTime.Today.AddMonths(4),
						HeadshotPercentage = 49.8
					},
				},
				KillVelocityPistol = new List<KillVelocityChart>
				{
					new KillVelocityChart
					{
						Date = DateTime.Today,
						VelocityAverage = 100
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(3),
						VelocityAverage = 70
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(7),
						VelocityAverage = 80
					}
				},
				KillVelocitySniper = new List<KillVelocityChart>
				{
					new KillVelocityChart
					{
						Date = DateTime.Today,
						VelocityAverage = 12
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(3),
						VelocityAverage = 8
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(7),
						VelocityAverage = 5
					}
				},
				KillVelocityHeavy = new List<KillVelocityChart>
				{
					new KillVelocityChart
					{
						Date = DateTime.Today,
						VelocityAverage = 74
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(3),
						VelocityAverage = 66
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(7),
						VelocityAverage = 80
					}
				},
				KillVelocitySmg = new List<KillVelocityChart>
				{
					new KillVelocityChart
					{
						Date = DateTime.Today,
						VelocityAverage = 120
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(3),
						VelocityAverage = 110
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(7),
						VelocityAverage = 100
					}
				},
				KillVelocityRifle = new List<KillVelocityChart>
				{
					new KillVelocityChart
					{
						Date = DateTime.Today,
						VelocityAverage = 30
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(3),
						VelocityAverage = 40
					},
					new KillVelocityChart
					{
						Date = DateTime.Today.AddDays(7),
						VelocityAverage = 20
					}
				}
			});
		}
	}
}
