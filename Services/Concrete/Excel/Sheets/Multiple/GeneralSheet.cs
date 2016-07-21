using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
	public class GeneralSheet : AbstractMultipleSheet
	{
		public GeneralSheet(IWorkbook workbook, List<Demo> demos)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Filename", CellType.String },
				{ "ID", CellType.String },
				{ "Date", CellType.String },
				{ "Type", CellType.String },
				{ "Source", CellType.String },
				{ "Map", CellType.String },
				{ "Hostname", CellType.String },
				{ "Client", CellType.String },
				{ "Server Tickrate", CellType.Numeric },
				{ "Framerate", CellType.Numeric },
				{ "Duration", CellType.Numeric },
				{ "Ticks", CellType.Numeric },
				{ "Name team 1", CellType.String },
				{ "Name team 2", CellType.String },
				{ "Score team 1", CellType.Numeric },
				{ "Score team 2", CellType.Numeric },
				{ "Score 1st half team 1", CellType.Numeric },
				{ "Score 1st half team 2", CellType.Numeric },
				{ "Score 2nd half team 1", CellType.Numeric },
				{ "Score 2nd half team 2", CellType.Numeric },
				{ "Winner", CellType.String },
				{ "Kills", CellType.Numeric },
				{ "Assists", CellType.Numeric },
				{ "5K", CellType.Numeric },
				{ "4K", CellType.Numeric },
				{ "3K", CellType.Numeric },
				{ "2K", CellType.Numeric },
				{ "1K", CellType.Numeric },
				{ "Trade Kill", CellType.Numeric },
				{ "Average Damage Per Round", CellType.Numeric },
				{ "Total Damage Health", CellType.Numeric },
				{ "Total Damage Armor", CellType.Numeric },
				{ "Clutch", CellType.Numeric },
				{ "Bomb Defused", CellType.Numeric },
				{ "Bomb Exploded", CellType.Numeric },
				{ "Bomb Planted", CellType.Numeric },
				{ "Flashbang", CellType.Numeric },
				{ "Smoke", CellType.Numeric },
				{ "HE", CellType.Numeric },
				{ "Decoy", CellType.Numeric },
				{ "Molotov", CellType.Numeric },
				{ "Incendiary", CellType.Numeric },
				{ "Shots", CellType.Numeric },
				{ "Hits", CellType.Numeric },
				{ "Round", CellType.Numeric },
				{ "Comment", CellType.String },
				{ "Cheater", CellType.Boolean }
			};
			Demos = demos;
			Sheet = workbook.CreateSheet("General");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				int rowCount = 1;
				foreach (Demo demo in Demos)
				{
					IRow row = Sheet.CreateRow(rowCount++);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, demo.Name);
					SetCellValue(row, columnNumber++, CellType.String, demo.Id);
					SetCellValue(row, columnNumber++, CellType.String, demo.DateAsString);
					SetCellValue(row, columnNumber++, CellType.String, demo.Type);
					SetCellValue(row, columnNumber++, CellType.String, demo.SourceName);
					SetCellValue(row, columnNumber++, CellType.String, demo.MapName);
					SetCellValue(row, columnNumber++, CellType.String, demo.Hostname);
					SetCellValue(row, columnNumber++, CellType.String, demo.ClientName);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ServerTickrate);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.Tickrate);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.Duration);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.Ticks);
					SetCellValue(row, columnNumber++, CellType.String, demo.TeamCT.Name);
					SetCellValue(row, columnNumber++, CellType.String, demo.TeamT.Name);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ScoreTeam1);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ScoreTeam2);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ScoreFirstHalfTeam1);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ScoreFirstHalfTeam2);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ScoreSecondHalfTeam1);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ScoreSecondHalfTeam2);
					SetCellValue(row, columnNumber++, CellType.String, demo.Winner.Name);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.KillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.AssistCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.FiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.FourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ThreeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.TwoKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.OneKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.TradeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.AverageHealthDamage);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.DamageHealthCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.DamageArmorCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.ClutchCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.BombDefusedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.BombExplodedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.BombPlantedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.FlashbangThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.SmokeThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.HeThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.DecoyThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.MolotovThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.IncendiaryThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.WeaponFiredCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.HitCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, demo.Rounds.Count);
					SetCellValue(row, columnNumber++, CellType.String, demo.Comment);
					SetCellValue(row, columnNumber, CellType.Boolean, demo.HasCheater);
				}
			});
		}
	}
}
