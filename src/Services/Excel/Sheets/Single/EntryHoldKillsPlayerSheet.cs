using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Single
{
	public class EntryHoldKillsPlayerSheet : AbstractSingleSheet
	{
		public EntryHoldKillsPlayerSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Name", CellType.String },
				{ "SteamID", CellType.String },
				{ "Total", CellType.Numeric },
				{ "Win", CellType.Numeric },
				{ "Loss", CellType.Numeric },
				{ "Ratio", CellType.Numeric }
			};
			Demo = demo;
			Sheet = workbook.CreateSheet("Entry Hold Kills Players");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				int rowNumber = 1;

				foreach (PlayerExtended player in Demo.Players)
				{
					IRow row = Sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, player.Name);
					SetCellValue(row, columnNumber++, CellType.String, player.SteamId.ToString());
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryHoldKills.Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryHoldKillWonCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryHoldKillLossCount);
					SetCellValue(row, columnNumber, CellType.Numeric, player.RatioEntryHoldKill);

					rowNumber++;
				}
			});
		}
	}
}