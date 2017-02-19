using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
	public class GeneralSheet : AbstractSingleSheet
	{
		public GeneralSheet(IWorkbook workbook, Demo demo)
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
				{ "Trade kill", CellType.Numeric },
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
			Demo = demo;
			Sheet = workbook.CreateSheet("General");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				IRow row = Sheet.CreateRow(1);
				int columnNumber = 0;
				SetCellValue(row, columnNumber++, CellType.String, Demo.Name);
				SetCellValue(row, columnNumber++, CellType.String, Demo.Id);
				SetCellValue(row, columnNumber++, CellType.String, Demo.DateAsString);
				SetCellValue(row, columnNumber++, CellType.String, Demo.Type);
				SetCellValue(row, columnNumber++, CellType.String, Demo.SourceName);
				SetCellValue(row, columnNumber++, CellType.String, Demo.MapName);
				SetCellValue(row, columnNumber++, CellType.String, Demo.Hostname);
				SetCellValue(row, columnNumber++, CellType.String, Demo.ClientName);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ServerTickrate);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.Tickrate);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.Duration);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.Ticks);
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamCT.Name);
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreTeamCt);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreTeamT);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreFirstHalfTeamCt);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreFirstHalfTeamT);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreSecondHalfTeamCt);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreSecondHalfTeamT);
				SetCellValue(row, columnNumber++, CellType.String, Demo.Winner != null ? Demo.Winner.Name : string.Empty);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.KillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.AssistCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.FiveKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.FourKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ThreeKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TwoKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.OneKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TradeKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.AverageHealthDamage);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.DamageHealthCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.DamageArmorCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ClutchCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.BombDefusedCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.BombExplodedCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.BombPlantedCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.FlashbangThrownCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.SmokeThrownCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.HeThrownCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.DecoyThrownCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.MolotovThrownCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.IncendiaryThrownCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.WeaponFiredCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.HitCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.Rounds.Count);
				SetCellValue(row, columnNumber++, CellType.String, Demo.Comment);
				SetCellValue(row, columnNumber, CellType.Boolean, Demo.HasCheater);
			});
		}
	}
}
