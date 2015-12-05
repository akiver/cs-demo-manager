using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public class GeneralSheet : AbstractSheet
	{
		private readonly ISheet _sheet;

		private readonly Demo _demo;

		public Dictionary<string, CellType> Headers => new Dictionary<string, CellType>(){
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

		public GeneralSheet(IWorkbook workbook, Demo demo)
		{
			_demo = demo;
			_sheet = workbook.CreateSheet("General");
		}

		public override async Task Generate()
		{
			await GenerateHeaders();
			await GenerateContent();
		}

		private async Task GenerateHeaders()
		{
			await Task.Factory.StartNew(() =>
			{
				IRow row = _sheet.CreateRow(0);
				int i = 0;
				foreach (KeyValuePair<string, CellType> pair in Headers)
				{
					ICell cell = row.CreateCell(i);
					cell.SetCellType(pair.Value);
					cell.SetCellValue(pair.Key);
					i++;
				}
			});
		}

		private async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				IRow row = _sheet.CreateRow(1);
				int columnNumber = 0;
				SetCellValue(row, columnNumber++, CellType.String, _demo.Name);
				SetCellValue(row, columnNumber++, CellType.String, _demo.Type);
				SetCellValue(row, columnNumber++, CellType.String, _demo.SourceName);
				SetCellValue(row, columnNumber++, CellType.String, _demo.MapName);
				SetCellValue(row, columnNumber++, CellType.String, _demo.Hostname);
				SetCellValue(row, columnNumber++, CellType.String, _demo.ClientName);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ServerTickrate);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.Tickrate);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.Duration);
				SetCellValue(row, columnNumber++, CellType.String, _demo.TeamCT.Name);
				SetCellValue(row, columnNumber++, CellType.String, _demo.TeamT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ScoreTeam1);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ScoreTeam2);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ScoreFirstHalfTeam1);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ScoreFirstHalfTeam2);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ScoreSecondHalfTeam1);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ScoreSecondHalfTeam2);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.Kills.Count);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.FiveKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.FourKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ThreeKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TwoKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.OneKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.AverageDamageCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TotalDamageHealthCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TotalDamageArmorCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.ClutchCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.BombDefusedCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.BombExplodedCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.BombPlantedCount);
				SetCellValue(row, columnNumber++, CellType.String, _demo.Comment);
				SetCellValue(row, columnNumber, CellType.Boolean, _demo.HasCheater);
			});
		}
	}
}