using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public class EntryKillsRoundSheet : AbstractSheet
	{
		private readonly ISheet _sheet;

		private readonly Demo _demo;

		public Dictionary<string, CellType> Headers => new Dictionary<string, CellType>(){
			{ "Number", CellType.Numeric },
			{ "Killer Name", CellType.String},
			{ "Killer SteamID", CellType.String },
			{ "Killed Name", CellType.String },
			{ "Killed SteamID", CellType.String },
			{ "Weapon", CellType.String },
			{ "Result", CellType.String }
		};

		public EntryKillsRoundSheet(IWorkbook workbook, Demo demo)
		{
			_demo = demo;
			_sheet = workbook.CreateSheet("Entry Kills Rounds");
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

				foreach (Round round in _demo.Rounds)
				{
					IRow row = _sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Number);
					if (round.EntryKillEvent != null)
					{
						SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.Killer.Name);
						SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.Killer.SteamId.ToString());
						SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.Killed.Name);
						SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.Killed.SteamId.ToString());
						SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.Weapon.Name);
						SetCellValue(row, columnNumber, CellType.String, round.EntryKillEvent.Result);
					}

					rowNumber++;
				}
			});
		}
	}
}