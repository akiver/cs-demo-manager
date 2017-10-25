using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
	public class EntryHoldKillsRoundSheet : AbstractSingleSheet
	{
		public EntryHoldKillsRoundSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Number", CellType.Numeric },
				{ "Killer Name", CellType.String},
				{ "Killer SteamID", CellType.String },
				{ "Victim Name", CellType.String },
				{ "Victim SteamID", CellType.String },
				{ "Weapon", CellType.String },
				{ "Round Won", CellType.String }
			};
			Demo = demo;
			Sheet = workbook.CreateSheet("Entry Hold Kills Rounds");
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
					if (round.EntryHoldKillEvent != null)
					{
						SetCellValue(row, columnNumber++, CellType.String, round.EntryHoldKillEvent.KillerName);
						SetCellValue(row, columnNumber++, CellType.String, round.EntryHoldKillEvent.KillerSteamId.ToString());
						SetCellValue(row, columnNumber++, CellType.String, round.EntryHoldKillEvent.KilledName);
						SetCellValue(row, columnNumber++, CellType.String, round.EntryHoldKillEvent.KilledSteamId.ToString());
						SetCellValue(row, columnNumber++, CellType.String, round.EntryHoldKillEvent.Weapon.Name);
						SetCellValue(row, columnNumber, CellType.String, round.EntryHoldKillEvent.HasWonRound ? "yes" : "no");
					}

					rowNumber++;
				}
			});
		}
	}
}