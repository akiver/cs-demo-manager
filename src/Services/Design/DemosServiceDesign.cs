using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Source;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;
using DemoInfo;

namespace CSGO_Demos_Manager.Services.Design
{
	public class DemosDesignService : IDemosService
	{
		public Task<List<Demo>> GetDemosHeader(List<string> folders)
		{
			List<Demo> demos = new List<Demo>();

			for (int i = 0; i < 20; i++)
			{
				ObservableCollection<PlayerExtended> players = new ObservableCollection<PlayerExtended>();
				Random random = new Random();

				ObservableCollection<EntryKillEvent> entryKills = new ObservableCollection<EntryKillEvent>();
				for (int indexEntryKill = 0; indexEntryKill < random.Next(5); indexEntryKill++)
				{
					PlayerExtended killer = players.ElementAt(random.Next(0, 9));
					PlayerExtended killed = players.ElementAt(random.Next(0, 9));
					EntryKillEvent entryKill = new EntryKillEvent(random.Next(7000, 100000))
					{
						KilledSteamId = killed.SteamId,
						KilledName = killed.Name,
						KilledSide = Team.Terrorist,
						KillerSteamId = killer.SteamId,
						KillerName = killer.Name,
						KillerSide = Team.CounterTerrorist
					};
					entryKills.Add(entryKill);
				}

				for (int j = 0; j < 10; j++)
				{
					PlayerExtended player = new PlayerExtended
					{
						Name = "player" + (j + 1),
						HeadshotCount = random.Next(14),
						OnekillCount = random.Next(10, 30),
						TwokillCount = random.Next(10, 20),
						ThreekillCount = random.Next(0, 10),
						FourKillCount = random.Next(0, 5),
						FiveKillCount = random.Next(0, 2),
						Clutch1V1Count = random.Next(1),
						Clutch1V2Count = random.Next(1),
						Clutch1V3Count = random.Next(1),
						Clutch1V4Count = random.Next(1),
						Clutch1V5Count = random.Next(1),
						BombDefusedCount = random.Next(0, 2),
						BombPlantedCount = random.Next(0, 2),
						EntryKills = entryKills,
						DeathCount = random.Next(0, 32),
						KillsCount = random.Next(30),
						AssistCount = random.Next(15),
						Score = random.Next(10, 80),
						RoundMvpCount = random.Next(6)
					};

					players.Add(player);
				}

				ObservableCollection<Round> rounds = new ObservableCollection<Round>();
				for (int k = 0; k < 32; k++)
				{
					Round round = new Round
					{
						Number = k + 1,
						OneKillCount = random.Next(5),
						TwoKillCount = random.Next(2),
						ThreeKillCount = random.Next(1),
						FourKillCount = random.Next(1),
						FiveKillCount = random.Next(1),
						EquipementValueTeam1 = random.Next(4200, 30000),
						EquipementValueTeam2 = random.Next(4200, 30000),
						StartMoneyTeam1 = random.Next(4200, 50000),
						StartMoneyTeam2 = random.Next(4200, 50000),
						Tick = random.Next(7000, 100000)
					};

					rounds.Add(round);
				}

				// TODO add teams and fix design time
				Demo demo = new Demo
				{
					Id = "de_dust25445648778447878",
					Name = "mydemo" + (i + 1) + ".dem",
					Tickrate = 128,
					MapName = "de_dust2",
					ClientName = "localhost",
					Hostname = "local",
					OneKillCount = random.Next(50, 90),
					TwoKillCount = random.Next(20, 50),
					ThreeKillCount = random.Next(10),
					FourKillCount = random.Next(3),
					FiveKillCount = random.Next(1),
					Path = "C:\\mydemo.dem",
					ScoreTeam1 = 16,
					ScoreTeam2 = 6,
					Type = "GOTV",
					Comment = "comment",
					ScoreFirstHalfTeam1 = 10,
					ScoreFirstHalfTeam2 = 5,
					ScoreSecondHalfTeam1 = 6,
					ScoreSecondHalfTeam2 = 1,
					Players = players,
					MostBombPlantedPlayer = players.ElementAt(random.Next(10)),
					MostHeadshotPlayer = players.ElementAt(random.Next(10)),
					Rounds = rounds
				};

				demos.Add(demo);
			}

			return Task.FromResult(demos);
		}

		public Task<Demo> AnalyzeDemo(Demo demo, CancellationToken token)
		{
			Random random = new Random();

			ObservableCollection<PlayerExtended> players = new ObservableCollection<PlayerExtended>();
			for (int i = 0; i < 10; i++)
			{
				PlayerExtended player = new PlayerExtended
				{
					Name = "player" + (i + 1),
					HeadshotCount = random.Next(14),
					OnekillCount = random.Next(10, 30),
					TwokillCount = random.Next(10, 20),
					ThreekillCount = random.Next(0, 10),
					FourKillCount = random.Next(0, 5),
					FiveKillCount = random.Next(0, 2),
					Clutch1V1Count = random.Next(1),
					Clutch1V2Count = random.Next(1),
					Clutch1V3Count = random.Next(1),
					Clutch1V4Count = random.Next(1),
					Clutch1V5Count = random.Next(1),
					BombDefusedCount = random.Next(0, 2),
					BombPlantedCount = random.Next(0, 2),
					DeathCount = random.Next(0, 32),
					KillsCount = random.Next(30),
					AssistCount = random.Next(15),
					Score = random.Next(10, 80),
					RoundMvpCount = random.Next(6),
					RankNumberNew = 5,
					RankNumberOld = 4,
					RatingHltv = (float)random.NextDouble(),
					SteamId = random.Next(1000, 800000),
					IsOverwatchBanned = random.Next(100) < 40,
					IsVacBanned = random.Next(100) < 40,
					TeamKillCount = random.Next(0, 1),
					WinCount = random.Next(10, 687)
				};

				players.Add(player);

				ObservableCollection<EntryKillEvent> entryKills = new ObservableCollection<EntryKillEvent>();
				for (int indexEntryKill = 0; indexEntryKill < random.Next(5); indexEntryKill++)
				{
					PlayerExtended killer = players.ElementAt(random.Next(0, 9));
					PlayerExtended killed = players.ElementAt(random.Next(0, 9));
					EntryKillEvent entryKill = new EntryKillEvent(random.Next(7000, 100000))
					{
						KilledSteamId = killed.SteamId,
						KilledName = killed.Name,
						KilledSide = Team.Terrorist,
						KillerSteamId = killer.SteamId,
						KillerName = killer.Name,
						KillerSide = Team.CounterTerrorist
					};
					entryKills.Add(entryKill);
				}

				ObservableCollection<OpenKillEvent> openKills = new ObservableCollection<OpenKillEvent>();
				for (int indexOpenKill = 0; indexOpenKill < random.Next(5); indexOpenKill++)
				{
					PlayerExtended killer = players.ElementAt(random.Next(0, 9));
					PlayerExtended killed = players.ElementAt(random.Next(0, 9));
					OpenKillEvent openKill = new OpenKillEvent(random.Next(7000, 100000))
					{
						KilledSteamId = killed.SteamId,
						KilledName = killed.Name,
						KilledSide = Team.Terrorist,
						KillerSteamId = killer.SteamId,
						KillerName = killer.Name,
						KillerSide = Team.CounterTerrorist
					};
					openKills.Add(openKill);
				}

				players.Last().EntryKills = entryKills;
				players.Last().OpeningKills = openKills;
			}

			ObservableCollection<TeamExtended> teams = new ObservableCollection<TeamExtended>
			{
				new TeamExtended
				{
					Name = "Team 1",
					Players = new ObservableCollection<PlayerExtended>(players.Take(5))
				},
				new TeamExtended
				{
					Name = "Team 2",
					Players = new ObservableCollection<PlayerExtended>(players.Skip(5).Take(5))
				}
			};

			ObservableCollection<Round> rounds = new ObservableCollection<Round>();
			for (int i = 0; i < 32; i++)
			{
				Round round = new Round
				{
					Number = i + 1,
					OneKillCount = random.Next(5),
					TwoKillCount = random.Next(2),
					ThreeKillCount = random.Next(1),
					FourKillCount = random.Next(1),
					FiveKillCount = random.Next(1),
					EquipementValueTeam1 = random.Next(4200, 30000),
					EquipementValueTeam2 = random.Next(4200, 30000),
					StartMoneyTeam1 = random.Next(4200, 50000),
					StartMoneyTeam2 = random.Next(4200, 50000),
					Tick = random.Next(7000, 100000),
					WinnerName = teams[random.Next(0, 2)].Name
				};

				rounds.Add(round);
			}

			demo.Id = "de_dust25445648778447878";
			demo.Source = new Valve();
			demo.Name = "esea_nip_vs_titan.dem";
			demo.Tickrate = 15;
			demo.ServerTickrate = 128;
			demo.MapName = "de_dust2";
			demo.ClientName = "localhost";
			demo.Hostname = "local";
			demo.OneKillCount = 90;
			demo.TwoKillCount = 30;
			demo.ThreeKillCount = 25;
			demo.FourKillCount = 3;
			demo.FiveKillCount = 1;
			demo.Path = "C:\\mydemo.dem";
			demo.ScoreTeam1 = 16;
			demo.ScoreTeam2 = 6;
			demo.Type = "GOTV";
			demo.Comment = "comment";
			demo.ScoreFirstHalfTeam1 = 10;
			demo.ScoreFirstHalfTeam2 = 5;
			demo.ScoreSecondHalfTeam1 = 6;
			demo.ScoreSecondHalfTeam2 = 1;
			demo.Players = players;
			demo.MostBombPlantedPlayer = players.ElementAt(random.Next(10));
			demo.MostHeadshotPlayer = players.ElementAt(random.Next(10));
			demo.MostEntryKillPlayer = players.ElementAt(random.Next(10));
			demo.MostKillingWeapon = new Weapon
			{
				Name = "AK-47"
			};
			demo.Rounds = rounds;

			return Task.FromResult(demo);
		}

		public Task SaveComment(Demo demo, string comment)
		{
			demo.Comment = comment;
			return Task.FromResult(demo);
		}

		public Task SaveStatus(Demo demo, string status)
		{
			demo.Status = status;
			return Task.FromResult(demo);
		}

		public Task SetSource(ObservableCollection<Demo> demos, string source)
		{
			return Task.FromResult(true);
		}

		public Task<Demo> AnalyzePlayersPosition(Demo demo, CancellationToken token)
		{
			return Task.FromResult(demo);
		}

		public Task<Demo> AnalyzeHeatmapPoints(Demo demo, CancellationToken token)
		{
			return Task.FromResult(demo);
		}

		public Task<List<Demo>> GetDemosFromBackup(string jsonFile)
		{
			return Task.FromResult(new List<Demo>());
		}

		public Task<Demo> AnalyzeBannedPlayersAsync(Demo demo)
		{
			return Task.FromResult(demo);
		}

		public Task<Rank> GetLastRankAccountStatsAsync()
		{
			return Task.FromResult(AppSettings.RankList[0]);
		}

		public Task<List<RankDateChart>> GetRankDateChartDataAsync()
		{
			return Task.FromResult(new List<RankDateChart>
			{
				new RankDateChart
				{
					Date = DateTime.Now,
					NewRank = 1
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(1),
					NewRank = 2
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(2),
					NewRank = 3
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(3),
					NewRank = 4
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(4),
					NewRank = 4
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(5),
					NewRank = 3
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(6),
					NewRank = 4
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(7),
					NewRank = 5
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(8),
					NewRank = 6
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(9),
					NewRank = 7
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(10),
					NewRank = 8
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(11),
					NewRank = 9
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(12),
					NewRank = 10
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(13),
					NewRank = 11
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(14),
					NewRank = 11
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(15),
					NewRank = 11
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(16),
					NewRank = 12
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(17),
					NewRank = 13
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(18),
					NewRank = 13
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(19),
					NewRank = 14
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(20),
					NewRank = 14
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(21),
					NewRank = 15
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(22),
					NewRank = 16
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(23),
					NewRank = 17
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(24),
					NewRank = 18
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(25),
					NewRank = 18
				},
				new RankDateChart
				{
					Date = DateTime.Now.AddDays(26),
					NewRank = 18
				}
			});
		}

		public Task<OverallStats> GetGeneralAccountStatsAsync()
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

		public Task<MapStats> GetMapStatsAsync()
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

		public Task<WeaponStats> GetWeaponStatsAsync()
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
				FlashbangThrowedCount = 352,
				SmokeThrowedCount = 1456,
				DecoyThrowedCount = 354,
				HeGrenadeThrowedCount = 452,
				MolotovThrowedCount = 236,
				IncendiaryThrowedCount = 25
			});
		}

		public Task<List<Demo>> GetDemosPlayer(string steamId)
		{
			return Task.FromResult(new List<Demo>());
		}

		public Task<ProgressStats> GetProgressStatsAsync()
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
				}
			});
		}

		public Task<bool> DeleteDemo(Demo demo)
		{
			return Task.FromResult(true);
		}
	}
}
