using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Multiple
{
	public class PlayersSheet : AbstractMultipleSheet
	{
		public PlayersSheet(IWorkbook workbook, List<Demo> demos)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Name", CellType.String },
				{ "SteamID", CellType.String },
				{ "Match", CellType.Numeric },
				{ "Kills", CellType.Numeric },
				{ "Assists", CellType.Numeric },
				{ "Deaths", CellType.Numeric },
				{ "K/D", CellType.Numeric },
				{ "HS", CellType.Numeric },
				{ "HS%", CellType.Numeric },
				{ "Rounds", CellType.Numeric },
				{ "Rating", CellType.Numeric },
				{ "5K", CellType.Numeric },
				{ "4K", CellType.Numeric },
				{ "3K", CellType.Numeric },
				{ "2K", CellType.Numeric },
				{ "1K", CellType.Numeric },
				{ "Team kill", CellType.Numeric },
				{ "Bomb planted", CellType.Numeric },
				{ "Bomb defused", CellType.Numeric },
				{ "MVP", CellType.Numeric },
				{ "Score", CellType.Numeric },
				{ "Clutch", CellType.Numeric },
				{ "Clutch lost", CellType.Numeric },
				{ "1v1", CellType.Numeric },
				{ "1v2", CellType.Numeric },
				{ "1v3", CellType.Numeric },
				{ "1v4", CellType.Numeric },
				{ "1v5", CellType.Numeric },
				{ "Entry kill", CellType.Numeric },
				{ "Entry kill win", CellType.Numeric },
				{ "Entry kill lost", CellType.Numeric },
				{ "Entry kill win %", CellType.Numeric },
				{ "Open kill", CellType.Numeric },
				{ "Open kill win", CellType.Numeric },
				{ "Open kill lost", CellType.Numeric },
				{ "Open kill win %", CellType.Numeric },
				{ "KPR", CellType.Numeric },
				{ "APR", CellType.Numeric },
				{ "DPR", CellType.Numeric },
				{ "ADR", CellType.Numeric },
				{ "TDH", CellType.Numeric },
				{ "TDA", CellType.Numeric },
				{ "Flashbang throwed", CellType.Numeric },
				{ "Smoke throwed", CellType.Numeric },
				{ "HE throwed", CellType.Numeric },
				{ "Decoy throwed", CellType.Numeric },
				{ "Molotov throwed", CellType.Numeric },
				{ "Incendiary throwed", CellType.Numeric },
				{ "Rank max", CellType.Numeric },
				{ "VAC", CellType.Boolean },
				{ "OW", CellType.Boolean }
			};
			Demos = demos;
			Sheet = workbook.CreateSheet("Players");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				List<PlayerExtended> players = new List<PlayerExtended>();

				foreach (Demo demo in Demos)
				{
					foreach (PlayerExtended player in demo.Players)
					{
						if (players.Contains(player))
						{
							PlayerExtended pl = players.First(p => p.Equals(player));
							pl.MatchCount++;
							pl.RankNumberNew = pl.RankNumberNew < player.RankNumberNew ? player.RankNumberNew : pl.RankNumberNew;
							pl.KillsCount += player.KillsCount;
							pl.AssistCount += player.AssistCount;
							pl.DeathCount += player.DeathCount;
							pl.FiveKillCount += player.FiveKillCount;
							pl.FourKillCount += player.FourKillCount;
							pl.ThreekillCount += player.ThreekillCount;
							pl.TwokillCount += player.TwokillCount;
							pl.OnekillCount += player.OnekillCount;
							pl.HeadshotCount += player.HeadshotCount;
							pl.TeamKillCount += player.TeamKillCount;
							pl.Clutch1V1Count += player.Clutch1V1Count;
							pl.Clutch1V2Count += player.Clutch1V2Count;
							pl.Clutch1V3Count += player.Clutch1V3Count;
							pl.Clutch1V4Count += player.Clutch1V4Count;
							pl.Clutch1V5Count += player.Clutch1V5Count;
							pl.BombPlantedCount += player.BombPlantedCount;
							pl.BombDefusedCount += player.BombDefusedCount;
							pl.RoundMvpCount += player.RoundMvpCount;
							pl.Score += player.Score;
							pl.RatingHltv += player.RatingHltv;
							pl.RoundPlayedCount += player.RoundPlayedCount;
							pl.IsVacBanned = pl.IsVacBanned || player.IsVacBanned;
							pl.FlashbangThrowedCount += player.FlashbangThrowedCount;
							pl.SmokeThrowedCount += player.SmokeThrowedCount;
							pl.HeGrenadeThrowedCount += player.HeGrenadeThrowedCount;
							pl.DecoyThrowedCount += player.DecoyThrowedCount;
							pl.MolotovThrowedCount += player.MolotovThrowedCount;
							pl.IncendiaryThrowedCount += player.IncendiaryThrowedCount;
							pl.ClutchCount += player.ClutchCount;
							pl.ClutchLostCount += player.ClutchLostCount;
							pl.IsOverwatchBanned = pl.IsOverwatchBanned || player.IsOverwatchBanned;
							pl.EntryKills = new ObservableCollection<EntryKillEvent>(pl.EntryKills.Concat(player.EntryKills).ToList());
							pl.OpeningKills = new ObservableCollection<OpenKillEvent>(pl.OpeningKills.Concat(player.OpeningKills).ToList());
							pl.PlayersHurted = new ObservableCollection<PlayerHurtedEvent>(pl.PlayersHurted.Concat(player.PlayersHurted).ToList());
						}
						else
						{
							players.Add(player.Clone());
						}
					}
				}

				int rowCount = 1;
				foreach (PlayerExtended player in players)
				{
					IRow row = Sheet.CreateRow(rowCount++);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, player.Name);
					SetCellValue(row, columnNumber++, CellType.String, player.SteamId);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.MatchCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.KillsCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.AssistCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.DeathCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.KillDeathRatio);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.HeadshotCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.HeadshotPercent);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.RoundPlayedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.RatingHltv / Demos.Count());
					SetCellValue(row, columnNumber++, CellType.Numeric, player.FiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.FourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.ThreekillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.TwokillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.OnekillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.TeamKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.BombPlantedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.BombDefusedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.RoundMvpCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Score);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.ClutchCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.ClutchLostCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V1Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V2Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V3Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V4Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V5Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKills.Count());
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKillWinCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKillLossCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.RatioEntryKill);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.OpeningKills.Count());
					SetCellValue(row, columnNumber++, CellType.Numeric, player.OpenKillWinCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.OpenKillLossCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.RatioOpenKill);
					SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round((double)player.KillsCount / player.RoundPlayedCount, 2)); // KPR
					SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round((double)player.AssistCount / player.RoundPlayedCount, 2)); // APR
					SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round((double)player.DeathCount / player.RoundPlayedCount, 2)); // DPR
					SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round((double)player.TotalDamageHealthCount / player.RoundPlayedCount, 2)); // ADR
					SetCellValue(row, columnNumber++, CellType.Numeric, player.TotalDamageHealthCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.TotalDamageArmorCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.FlashbangThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.SmokeThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.HeGrenadeThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.DecoyThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.MolotovThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.IncendiaryThrowedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.RankNumberNew);
					SetCellValue(row, columnNumber++, CellType.Boolean, player.IsVacBanned);
					SetCellValue(row, columnNumber, CellType.Boolean, player.IsOverwatchBanned);
				}
			});
		}
	}
}
