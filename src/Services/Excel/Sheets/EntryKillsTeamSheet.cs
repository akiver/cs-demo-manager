using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public class EntryKillsTeamSheet : AbstractSheet
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

		public EntryKillsTeamSheet(IWorkbook workbook, Demo demo)
		{
			_demo = demo;
			_sheet = workbook.CreateSheet("Entry Kills Teams");
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
				int rowNumber = 1;

				foreach (TeamExtended team in _demo.Teams)
				{
					IRow row = _sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, team.Name);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.EntryKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.EntryKillWinCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, team.EntryKillLossCount);
					SetCellValue(row, columnNumber, CellType.String, team.RatioEntryKillAsString);

					rowNumber++;
				}
			});
		}
	}
}