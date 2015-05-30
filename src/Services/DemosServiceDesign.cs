using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
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
						KillsCount = random.Next(9),
						OneKillCount = random.Next(5),
						TwoKillCount = random.Next(2),
						ThreeKillCount = random.Next(1),
						FourKillCount = random.Next(1),
						FiveKillCount = random.Next(1),
						BombDefusedCount = random.Next(1),
						BombExplodedCount = random.Next(1),
						BombPlantedCount = random.Next(1),
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
					BombExplodedCount = random.Next(10),
					BombDefusedCount = random.Next(10),
					TotalKillCount = random.Next(90, 120),
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
			ObservableCollection<PlayerExtended> players = new ObservableCollection<PlayerExtended>();
			Random random = new Random();
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
					RoundMvpCount = random.Next(6)
				};

				players.Add(player);
			}

			ObservableCollection<Round> rounds = new ObservableCollection<Round>();
			for (int i = 0; i < 32; i++)
			{
				Round round = new Round
				{
					Number = i + 1,
					KillsCount = random.Next(9),
					OneKillCount = random.Next(5),
					TwoKillCount = random.Next(2),
					ThreeKillCount = random.Next(1),
					FourKillCount = random.Next(1),
					FiveKillCount = random.Next(1),
					BombDefusedCount = random.Next(1),
					BombExplodedCount = random.Next(1),
					BombPlantedCount = random.Next(1),
					EquipementValueTeam1 = random.Next(4200, 30000),
					EquipementValueTeam2 = random.Next(4200, 30000),
					StartMoneyTeam1 = random.Next(4200, 50000),
					StartMoneyTeam2 = random.Next(4200, 50000),
					Tick = random.Next(7000, 100000)
				};

				rounds.Add(round);
			}

			demo = new Demo
			{
				Id = "de_dust25445648778447878",
				Name = "esea_nip_vs_titan.dem",
				Tickrate = 128,
				MapName = "de_dust2",
				ClientName = "localhost",
				Hostname = "local",
				OneKillCount = 90,
				TwoKillCount = 30,
				ThreeKillCount = 25,
				FourKillCount = 3,
				FiveKillCount = 1,
				BombExplodedCount = 4,
				BombDefusedCount = 5,
				TotalKillCount = 105,
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
	}
}
