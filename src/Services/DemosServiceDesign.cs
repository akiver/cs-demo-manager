using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Source;
using CSGO_Demos_Manager.Models.Stats;
using DemoInfo;

namespace CSGO_Demos_Manager.Services
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
					EntryKillEvent entryKill = new EntryKillEvent(random.Next(7000, 100000))
					{
						KilledName = "killed" + indexEntryKill,
						KilledSteamId = random.Next(8000000),
						KilledTeam = Team.Terrorist,
						KillerName = "killer" + indexEntryKill,
						KillerSteamId = random.Next(800000),
						KillerTeam = Team.CounterTerrorist
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
					PlayersTeam1 = new ObservableCollection<PlayerExtended>(players.Take(5)),
					PlayersTeam2 = new ObservableCollection<PlayerExtended>(players.Skip(5).Take(5)),
					MostBombPlantedPlayer = players.ElementAt(random.Next(10)),
					MostHeadshotPlayer = players.ElementAt(random.Next(10)),
					Rounds = rounds
				};

				demos.Add(demo);
			}

			return Task.FromResult(demos);
		}

		public Task<Demo> AnalyzeDemo(Demo demo)
		{
			Random random = new Random();

			ObservableCollection<PlayerExtended> players = new ObservableCollection<PlayerExtended>();
			for (int i = 0; i < 10; i++)
			{
				ObservableCollection<EntryKillEvent> entryKills = new ObservableCollection<EntryKillEvent>();
				for (int indexEntryKill = 0; indexEntryKill < random.Next(5); indexEntryKill++)
				{
					EntryKillEvent entryKill = new EntryKillEvent(random.Next(7000, 100000))
					{
						KilledName = "killed" + indexEntryKill,
						KilledSteamId = random.Next(8000000),
						KilledTeam = Team.Terrorist,
						KillerName = "killer" + indexEntryKill,
						KillerSteamId = random.Next(800000),
						KillerTeam = Team.CounterTerrorist
					};
					entryKills.Add(entryKill);
				}

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
					EntryKills = entryKills,
					DeathCount = random.Next(0, 32),
					KillsCount = random.Next(30),
					AssistCount = random.Next(15),
					Score = random.Next(10, 80),
					RoundMvpCount = random.Next(6),
					RankNumberNew = 5,
					RankNumberOld = 4
				};

				players.Add(player);
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
					WinnerClanName = teams[random.Next(0, 2)].Name
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
			demo.PlayersTeam1 = teams[0].Players;
			demo.PlayersTeam2 = teams[1].Players;
			demo.MostBombPlantedPlayer = players.ElementAt(random.Next(10));
			demo.MostHeadshotPlayer = players.ElementAt(random.Next(10));
			demo.MostEntryKillPlayer = players.ElementAt(random.Next(10));
			demo.MostKillingWeapon = new Weapon
			{
				Name = "AK-47"
			};
			demo.Teams = teams;
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

		public Task<Demo> AnalyzePlayersPosition(Demo demo)
		{
			return Task.FromResult(demo);
		}

		public Task<Demo> AnalyzeHeatmapPoints(Demo demo)
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

		public Task<List<GenericDateChart>> GetRankDateChartDataAsync()
		{
			return Task.FromResult(new List<GenericDateChart>
			{
				new GenericDateChart
				{
					Date = DateTime.Now,
					Value = 1
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(1),
					Value = 2
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(2),
					Value = 3
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(3),
					Value = 4
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(4),
					Value = 4
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(5),
					Value = 3
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(6),
					Value = 4
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(7),
					Value = 5
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(8),
					Value = 6
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(9),
					Value = 7
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(10),
					Value = 8
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(11),
					Value = 9
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(12),
					Value = 10
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(13),
					Value = 11
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(14),
					Value = 11
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(15),
					Value = 11
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(16),
					Value = 12
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(17),
					Value = 13
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(18),
					Value = 13
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(19),
					Value = 14
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(20),
					Value = 14
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(21),
					Value = 15
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(22),
					Value = 16
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(23),
					Value = 17
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(24),
					Value = 18
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(25),
					Value = 18
				},
				new GenericDateChart
				{
					Date = DateTime.Now.AddDays(26),
					Value = 18
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
				MatchDrawCount = 7
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
				KillSg556Count = 1489,
				DeathSg556Count = 520,
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
				Win = new List<GenericDateChart>
				{
					new GenericDateChart
					{
						Date = DateTime.Now,
						Value = 50
					},
					new GenericDateChart
					{
						Date = DateTime.Now.AddMonths(1),
						Value = 20
					},
					new GenericDateChart
					{
						Date = DateTime.Now.AddMonths(2),
						Value = 60
					},
					new GenericDateChart
					{
						Date = DateTime.Now.AddMonths(3),
						Value = 10.5
					},
					new GenericDateChart
					{
						Date = DateTime.Now.AddMonths(4),
						Value = 70.5
					},
				},
				Kill = new List<GenericDateChart>
				{
					new GenericDateChart
					{
						Date = DateTime.Today,
						Value = 21
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(1),
						Value = 65
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(2),
						Value = 50
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(3),
						Value = 100
					},
				},
				Damage = new List<GenericDateChart>
				{
					new GenericDateChart
					{
						Date = DateTime.Today,
						Value = 1252
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(1),
						Value = 1600
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(2),
						Value = 1400
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(3),
						Value = 1000
					},
				},
				HeadshotRatio = new List<GenericDateChart>
				{
					new GenericDateChart
					{
						Date = DateTime.Today,
						Value = 30.4
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(1),
						Value = 50
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(3),
						Value = 54.5
					},
					new GenericDateChart
					{
						Date = DateTime.Today.AddMonths(4),
						Value = 49.8
					},
				}
			});
		}
	}
}
