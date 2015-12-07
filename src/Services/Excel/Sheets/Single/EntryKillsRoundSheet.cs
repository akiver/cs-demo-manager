using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Single
{
	public class EntryKillsRoundSheet : AbstractSingleSheet
	{
		public EntryKillsRoundSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Number", CellType.Numeric },
				{ "Killer Name", CellType.String},
				{ "Killer SteamID", CellType.String },
				{ "Killed Name", CellType.String },
				{ "Killed SteamID", CellType.String },
				{ "Weapon", CellType.String },
				{ "Result", CellType.String }
			};
			Demo = demo;
			Sheet = workbook.CreateSheet("Entry Kills Rounds");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				int rowNumber = 1;

				foreach (Round round in Demo.Rounds)
				{
					IRow row = Sheet.CreateRow(rowNumber);
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