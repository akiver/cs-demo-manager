using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public class OpenKillsTeamSheet : AbstractSheet
	{
		private readonly ISheet _sheet;

		private readonly Demo _demo;

		public Dictionary<string, CellType> Headers => new Dictionary<string, CellType>(){
			{ "Name", CellType.String },
			{ "Total", CellType.Numeric },
			{ "Win", CellType.Numeric },
			{ "Loss", CellType.Numeric },
			{ "Ratio", CellType.String }
		};

		public OpenKillsTeamSheet(IWorkbook workbook, Demo demo)
		{
			_demo = demo;
			_sheet = workbook.CreateSheet("Open Kills Teams");
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
				SetCellValue(row, columnNumber++, CellType.String, _demo.TeamCT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TeamCT.OpenKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TeamCT.OpenKillWinCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TeamCT.OpenKillLossCount);
				SetCellValue(row, columnNumber, CellType.String, _demo.TeamCT.RatioOpenKillAsString);

				row = _sheet.CreateRow(2);
				columnNumber = 0;
				SetCellValue(row, columnNumber++, CellType.String, _demo.TeamT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TeamT.OpenKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TeamT.OpenKillWinCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, _demo.TeamT.OpenKillLossCount);
				SetCellValue(row, columnNumber, CellType.String, _demo.TeamT.RatioOpenKillAsString);
			});
		}
	}
}