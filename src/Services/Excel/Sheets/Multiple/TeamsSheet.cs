using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using DemoInfo;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Multiple
{
	public class TeamsSheet : AbstractMultipleSheet
	{
		public TeamsSheet(IWorkbook workbook, List<Demo> demos)
		{
			Headers = new Dictionary<string, CellType>()
			{
				{"Name", CellType.String},
				{"Match", CellType.Numeric},
				{"Win", CellType.Numeric},
				{"Lost", CellType.Numeric},
				{"Kills", CellType.Numeric},
				{"Deaths", CellType.Numeric},
				{"Assists", CellType.Numeric},
				{"Rounds", CellType.Numeric},
				{"Round win", CellType.Numeric},
				{"Round lost", CellType.Numeric},
				{"Round CT win", CellType.Numeric},
				{"Round CT lost", CellType.Numeric},
				{"Round T win", CellType.Numeric},
				{"Round T lost", CellType.Numeric},
				{"Win pistol round", CellType.Numeric},
				{"Win eco round", CellType.Numeric},
				{"Win semi-eco round", CellType.Numeric},
				{"Win force-buy round", CellType.Numeric},
				{"Bomb planted", CellType.Numeric},
				{"Bomb defused", CellType.Numeric},
				{"Bomb exploded", CellType.Numeric},
				{"Bomb planted on A", CellType.Numeric},
				{"Bomb planted on B", CellType.Numeric},
				{"5K", CellType.Numeric},
				{"4K", CellType.Numeric},
				{"3K", CellType.Numeric},
				{"2K", CellType.Numeric},
				{"1K", CellType.Numeric},
				{"Flash", CellType.Numeric},
				{"HE", CellType.Numeric},
				{"Smoke", CellType.Numeric},
				{"Molotov", CellType.Numeric},
				{"Incendiary", CellType.Numeric},
				{"Decoy", CellType.Numeric},

			};
			Demos = demos;
			Sheet = workbook.CreateSheet("Teams");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				List<TeamExtended> teams = new List<TeamExtended>();
				foreach (Demo demo in Demos)
				{
					if (teams.Contains(demo.TeamCT))
					{
						TeamExtended team = teams.First(t => t.Equals(demo.TeamCT));
						UpdateTeamStats(demo, team);
					}
					else
					{
						TeamExtended team = demo.TeamCT.Clone();
						InitTeam(demo, team);
						teams.Add(team);
					}

					if (teams.Contains(demo.TeamT))
					{
						TeamExtended team = teams.First(t => t.Equals(demo.TeamT));
						UpdateTeamStats(demo, team);
					}
					else
					{
						TeamExtended team = demo.TeamT.Clone();
						InitTeam(demo, team);
						teams.Add(team);
					}
				}

				int rowCount = 1;
				foreach (TeamExtended team in teams)
				{
					IRow row = Sheet.CreateRow(rowCount++);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, team.Name);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.MatchCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.LostCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.KillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.DeathCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.AssistCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.RoundCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinRoundCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.LostRoundCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinRoundCtCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.LostRoundCtCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinRoundTCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.LostRoundTCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinPistolRoundCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinEcoRoundCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinSemiEcoRoundCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.WinForceBuyRoundCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.BombPlantedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.BombDefusedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.BombExplodedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.BombPlantedOnACount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.BombPlantedOnBCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.FiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.FourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.ThreeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.TwoKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.OneKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.FlashbangThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.HeGrenadeThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.SmokeThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.MolotovThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.IncendiaryThrowedCount);
					SetCellValue(row, columnNumber, CellType.Numeric, team.DecoyThrowedCount);
				}
			});
		}


		/// <summary>
		/// Initialize team values for the first time
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="team"></param>
		private static void InitTeam(Demo demo, TeamExtended team)
		{
			team.RoundCount = demo.Rounds.Count();
			UpdateWinner(demo, team);
			UpdateRoundsStats(demo, team);
			UpdateBombStats(demo, team);
		}

		/// <summary>
		/// Update team's stats
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="team"></param>
		private static void UpdateTeamStats(Demo demo, TeamExtended team)
		{
			team.MatchCount++;
			team.RoundCount += demo.Rounds.Count();
			team.Players = demo.TeamCT.Equals(team)
				? new ObservableCollection<PlayerExtended>(demo.TeamCT.Players.Concat(team.Players).ToList())
				: new ObservableCollection<PlayerExtended>(demo.TeamT.Players.Concat(team.Players).ToList());
			UpdateWinner(demo, team);
			UpdateRoundsStats(demo, team);
			UpdateBombStats(demo, team);
		}

		private static void UpdateWinner(Demo demo, TeamExtended team)
		{
			if (demo.Winner.Equals(team))
			{
				team.WinCount++;
			}
			else
			{
				team.LostCount++;
			}
		}

		private static void UpdateRoundsStats(Demo demo, TeamExtended team)
		{
			foreach (Round round in demo.Rounds)
			{
				if (round.Winner.Equals(team))
				{
					team.WinRoundCount++;
					if (round.WinnerSide == Team.CounterTerrorist)
					{
						team.WinRoundCtCount++;
					}
					else
					{
						team.WinRoundTCount++;
					}
					if (round.SideTrouble != Team.Spectate)
					{
						switch (round.Type)
						{
							case RoundType.PISTOL_ROUND:
								team.WinPistolRoundCount++;
								break;
							case RoundType.ECO:
								team.WinEcoRoundCount++;
								break;
							case RoundType.SEMI_ECO:
								team.WinSemiEcoRoundCount++;
								break;
							case RoundType.FORCE_BUY:
								team.WinForceBuyRoundCount++;
								break;
						}
					}
				}
				else
				{
					team.LostRoundCount++;
					if (round.WinnerSide == Team.CounterTerrorist)
					{
						team.LostRoundTCount++;
					}
					else
					{
						team.LostRoundCtCount++;
					}
				}
			}
		}

		private static void UpdateBombStats(Demo demo, TeamExtended team)
		{
			foreach (BombPlantedEvent plantedEvent in demo.BombPlanted)
			{
				if (team.Players.Contains(plantedEvent.Player))
				{
					if (plantedEvent.Site == "A")
					{
						team.BombPlantedOnACount++;
					}
					else
					{
						team.BombPlantedOnBCount++;
					}
				}
			}
		}
	}
}
