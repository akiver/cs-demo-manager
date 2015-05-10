using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public class EntryKillsPlayerSheet : AbstractSheet
	{
		private readonly ISheet _sheet;

		private readonly Demo _demo;

		public Dictionary<string, CellType> Headers => new Dictionary<string, CellType>(){
			{ "Name", CellType.String },
			{ "SteamID", CellType.String },
			{ "Total", CellType.Numeric },
			{ "Win", CellType.Numeric },
			{ "Loss", CellType.Numeric },
			{ "Ratio", CellType.String }
		};

		public EntryKillsPlayerSheet(IWorkbook workbook, Demo demo)
		{
			_demo = demo;
			_sheet = workbook.CreateSheet("Entry Kills Players");
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

				foreach (PlayerExtended player in _demo.Players)
				{
					IRow row = _sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, player.Name);
					SetCellValue(row, columnNumber++, CellType.String, player.SteamId.ToString());
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKills.Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKillWinCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKillLossCount);
					SetCellValue(row, columnNumber, CellType.String, player.RatioEntryKillAsString);

					rowNumber++;
				}
			});
		}
	}
}