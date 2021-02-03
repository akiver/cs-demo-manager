using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
	public class KillsSheet : AbstractMultipleSheet
	{
		public KillsSheet(IWorkbook workbook, List<Demo> demos)
		{
			Headers = new Dictionary<string, CellType>()
			{
				{"Demo ID", CellType.String},
				{"Tick", CellType.Numeric},
				{"Round", CellType.Numeric},
				{"Time death (s)", CellType.Numeric},
				{"Killer", CellType.String},
				{"Killer SteamID", CellType.String},
				{"Killer side", CellType.String},
				{"Killer team", CellType.String},
				{"Killer bot", CellType.Boolean},
				{"Killer blinded", CellType.Boolean},
				{"Killer vel X", CellType.Numeric},
				{"Killer vel Y", CellType.Numeric},
				{"Killer vel Z", CellType.Numeric},
				{"Victim", CellType.String},
				{"Victim SteamId", CellType.String},
				{"Victim side", CellType.String},
				{"Victim team", CellType.String},
				{"Victim bot", CellType.Boolean},
				{"Victim blinded", CellType.Boolean},
				{"Assister", CellType.String},
				{"Assister SteamID", CellType.String},
				{"assister bot", CellType.Boolean},
				{"Weapon", CellType.String},
				{"Headshot", CellType.Boolean},
				{"Crouching", CellType.Boolean},
				{"Trade kill", CellType.Boolean},
				{"Killer X", CellType.Numeric},
				{"Killer Y", CellType.Numeric},
				{"Victim X", CellType.Numeric},
				{"Victim Y", CellType.Numeric},
			};
			Demos = demos;
			Sheet = workbook.CreateSheet("Kills");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				int rowCount = 1;

				foreach (Demo demo in Demos)
				{
					foreach (KillEvent e in demo.Kills)
					{
						IRow row = Sheet.CreateRow(rowCount++);
						int columnNumber = 0;
						SetCellValue(row, columnNumber++, CellType.String, demo.Id);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.Tick);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.RoundNumber);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.TimeDeathSeconds);
						SetCellValue(row, columnNumber++, CellType.String, e.KillerName);
						SetCellValue(row, columnNumber++, CellType.String, e.KillerSteamId);
						SetCellValue(row, columnNumber++, CellType.String, e.KillerSide.AsString());
						SetCellValue(row, columnNumber++, CellType.String, e.KillerTeam);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.KillerIsControllingBot);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.KillerIsBlinded);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.KillerVelocityX);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.KillerVelocityY);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.KillerVelocityZ);
						SetCellValue(row, columnNumber++, CellType.String, e.KilledName);
						SetCellValue(row, columnNumber++, CellType.String, e.KilledSteamId);
						SetCellValue(row, columnNumber++, CellType.String, e.KilledSide.AsString());
						SetCellValue(row, columnNumber++, CellType.String, e.KilledTeam);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.KilledIsControllingBot);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.VictimIsBlinded);
						SetCellValue(row, columnNumber++, CellType.String, e.AssisterName);
						SetCellValue(row, columnNumber++, CellType.String, e.AssisterSteamId);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.AssisterIsControllingBot);
						SetCellValue(row, columnNumber++, CellType.String, e.Weapon.Name);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.IsHeadshot);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.IsKillerCrouching);
						SetCellValue(row, columnNumber++, CellType.Boolean, e.IsTradeKill);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.Point.KillerX);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.Point.KillerY);
						SetCellValue(row, columnNumber++, CellType.Numeric, e.Point.VictimX);
						SetCellValue(row, columnNumber, CellType.Numeric, e.Point.VictimY);
					}
				}
			});
		}
	}
}
