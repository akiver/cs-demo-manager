using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Single
{
	public class EntryHoldKillsTeamSheet : AbstractSingleSheet
	{
		public EntryHoldKillsTeamSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Name", CellType.String },
				{ "Total", CellType.Numeric },
				{ "Win", CellType.Numeric },
				{ "Loss", CellType.Numeric },
				{ "Rate", CellType.Numeric }
			};
			Demo = demo;
			Sheet = workbook.CreateSheet("Entry Hold Kills Teams");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				IRow row = Sheet.CreateRow(1);
				int columnNumber = 0;
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamCT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamCT.EntryHoldKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamCT.EntryHoldKillWonCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamCT.EntryHoldKillLossCount);
				SetCellValue(row, columnNumber, CellType.Numeric, Demo.TeamCT.RatioEntryHoldKill);

				row = Sheet.CreateRow(2);
				columnNumber = 0;
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamT.EntryHoldKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamT.EntryHoldKillWonCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamT.EntryHoldKillLossCount);
				SetCellValue(row, columnNumber, CellType.Numeric, Demo.TeamT.RatioEntryHoldKill);
			});
		}
	}
}