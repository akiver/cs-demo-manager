using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Single
{
	public class EntryKillsTeamSheet : AbstractSingleSheet
	{
		public EntryKillsTeamSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Name", CellType.String },
				{ "Total", CellType.Numeric },
				{ "Win", CellType.Numeric },
				{ "Loss", CellType.Numeric },
				{ "Rate", CellType.Numeric }
			};
			Demo = demo;
			Sheet = workbook.CreateSheet("Entry Kills Teams");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				IRow row = Sheet.CreateRow(1);
				int columnNumber = 0;
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamCT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamCT.EntryKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamCT.EntryKillWonCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamCT.EntryKillLossCount);
				SetCellValue(row, columnNumber, CellType.Numeric, Demo.TeamCT.RatioEntryKill);

				row = Sheet.CreateRow(2);
				columnNumber = 0;
				SetCellValue(row, columnNumber++, CellType.String, Demo.TeamT.Name);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamT.EntryKillCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamT.EntryKillWonCount);
				SetCellValue(row, columnNumber++, CellType.Numeric, Demo.TeamT.EntryKillLossCount);
				SetCellValue(row, columnNumber, CellType.Numeric, Demo.TeamT.RatioEntryKill);
			});
		}
	}
}