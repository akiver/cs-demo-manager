using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Single
{
	public class GeneralSheet : AbstractSingleSheet
	{
		public GeneralSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Filename", CellType.String },
				{ "Type", CellType.String },
				{ "Source", CellType.String },
				{ "Map", CellType.String },
				{ "Hostname", CellType.String },
				{ "Client", CellType.String },
				{ "Server Tickrate", CellType.Numeric },
				{ "Framerate", CellType.Numeric },
				{ "Duration", CellType.Numeric },
				{ "Name team 1", CellType.String },
				{ "Name team 2", CellType.String },
				{ "Score team 1", CellType.Numeric },
				{ "Score team 2", CellType.Numeric },
				{ "Score 1st half team 1", CellType.Numeric },
				{ "Score 1st half team 2", CellType.Numeric },
				{ "Score 2nd half team 1", CellType.Numeric },
				{ "Score 2nd half team 2", CellType.Numeric },
				{ "Kills", CellType.Numeric },
				{ "5K", CellType.Numeric },
				{ "4K", CellType.Numeric },
				{ "3K", CellType.Numeric },
				{ "2K", CellType.Numeric },
				{ "1K", CellType.Numeric },
				{ "Average Damage Per Round", CellType.Numeric },
				{ "Total Damage Health", CellType.Numeric },
				{ "Total Damage Armor", CellType.Numeric },
				{ "Clutch", CellType.Numeric },
				{ "Bomb Defused", CellType.Numeric },
				{ "Bomb Exploded", CellType.Numeric },
				{ "Bomb Planted", CellType.Numeric },
				{ "Comment", CellType.String },
				{ "Cheater", CellType.Boolean },
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
				SetCellValue(row, columnNumber++, CellType.String, Demo.Type);
				SetCellValue(row, columnNumber++, CellType.String, Demo.SourceName);
				SetCellValue(row, columnNumber++, CellType.String, Demo.MapName);
				SetCellValue(row, columnNumber++, CellType.String, Demo.Hostname);
				SetCellValue(row, columnNumber++, CellType.String, Demo.ClientName);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ServerTickrate);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.Tickrate);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.Duration);
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamCT.Name);
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreTeam1);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreTeam2);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreFirstHalfTeam1);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreFirstHalfTeam2);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreSecondHalfTeam1);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ScoreSecondHalfTeam2);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.Kills.Count);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.FiveKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.FourKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ThreeKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TwoKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.OneKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.AverageDamageCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TotalDamageHealthCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TotalDamageArmorCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.ClutchCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.BombDefusedCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.BombExplodedCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.BombPlantedCount);
				SetCellValue(row, columnNumber++, CellType.String, Demo.Comment);
				SetCellValue(row, columnNumber, CellType.Boolean, Demo.HasCheater);
			});
		}
	}
}