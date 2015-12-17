using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Single
{
	public class OpenKillsRoundSheet : AbstractSingleSheet
	{
		public OpenKillsRoundSheet(IWorkbook workbook, Demo demo)
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
			Sheet = workbook.CreateSheet("Open Kills Rounds");
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
					if (round.OpenKillEvent != null)
					{
						SetCellValue(row, columnNumber++, CellType.String, round.OpenKillEvent.KillerName);
						SetCellValue(row, columnNumber++, CellType.String, round.OpenKillEvent.KillerSteamId.ToString());
						SetCellValue(row, columnNumber++, CellType.String, round.OpenKillEvent.KilledName);
						SetCellValue(row, columnNumber++, CellType.String, round.OpenKillEvent.KilledSteamId.ToString());
						SetCellValue(row, columnNumber++, CellType.String, round.OpenKillEvent.Weapon.Name);
						SetCellValue(row, columnNumber, CellType.String, round.OpenKillEvent.Result);
					}

					rowNumber++;
				}
			});
		}
	}
}